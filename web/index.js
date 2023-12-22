import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import cors from 'cors'
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";
import db from './Database.js'
import nodemailer from 'nodemailer';
import useMetafields from "./useMetafields.js";
import { LocalStorage } from "node-localstorage";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from 'fs';
import edit from './Images.js'
import createAppDataMetafields from './appDataMetaFild.js'
import defaultMetafieldSetup from "./defaultMetaFieldSetup.js";

const PORT2 = 5000;
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

let domain;
const app = express();
const app2 = express();
app2.options('*', cors());
app2.use(cors());
app2.use(bodyParser.urlencoded({ extended: false }));
app2.use(express.static('public'));
app2.use(bodyParser.json());
app.get(shopify.config.auth.path, shopify.auth.begin());
const uploadFolderPath = './uploads/';

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

const customFormData = `<div class="rendered-form"><div class="formbuilder-text form-group field-name"><label for="name" class="formbuilder-text-label">Name</label><input type="text" class="form-control" name="name" id="name"></div><div class="formbuilder-text form-group field-email"><label for="email" class="formbuilder-text-label">Email</label><input type="email" class="form-control" name="email" id="email"></div><div class="formbuilder-text form-group field-text"><label for="phone" class="formbuilder-text-label">Phone</label><input type="tel" class="form-control" name="phone" id="phone"></div><div class="formbuilder-textarea form-group field-textarea"><label for="message" class="formbuilder-textarea-label">Message</label><textarea class="form-control" name="message" id="message"></textarea></div><div class="formbuilder-button form-group field-button"><button type="submit" class="btn-primary btn" name="button" style="primary" id="button">Submit</button></div></div>`

const xmlFormData = [{ "type": "text", "label": "Name", "className": "form-control", "name": "name", "access": false, "subtype": "text" }, { "type": "text", "subtype": "email", "label": "Email", "className": "form-control", "name": "email", "access": false }, { "type": "text", "subtype": "tel", "label": "Phone", "className": "form-control", "name": "text", "access": false }, { "type": "textarea", "label": "Message", "className": "form-control", "name": "textarea", "access": false, "subtype": "textarea" }, { "type": "button", "subtype": "submit", "label": "Submit", "className": "btn-primary btn", "name": "button", "access": false, "style": "primary" }]


const myInstallationFxn = async (_req, res, next) => {
  const client = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  let shopName = client[0].name;
  db.query("INSERT INTO `CustomForm`(`customForm`, `xmlForm`, `shopName`) VALUES ('" + customFormData + "', '" + xmlFormData + "','" + shopName + "')", (err, result) => {
    if (err) {
      console.log("first", err)
    }
  })
  next()
}

const setDefaultDataForApp = async (req, res, next) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });
  const data = await client.query({
    data: `query {
      currentAppInstallation {
        id
      }
    }`
  });
  
  const dataArr = defaultMetafieldSetup(data.body.data.currentAppInstallation.id);
  let ourQuery = await createAppDataMetafields(dataArr[0]);
  await client.query({
    data: ourQuery,
  });
  next();
};

app.get(
  shopify.config.auth.callbackPath,
  [shopify.auth.callback(), myInstallationFxn, setDefaultDataForApp],
  shopify.redirectToShopifyOrAppRoot()
);

const uploadStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 25 * 1024 * 1024, },
});

function getFolderSize(folderPath) {
  let totalSize = 0;
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      totalSize += stats.size;
    } else if (stats.isDirectory()) {
      totalSize += getFolderSize(filePath);
    }
  }

  return totalSize;
}

const folderSize = getFolderSize(uploadFolderPath);
let folderSizePath = `${(folderSize / (1024 * 1024)).toFixed(2)} MB)`;
app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app2.post('/upload', upload.single('uploadFile'), (req, res) => {
  res.send({ data: req.files })
})

app.get("/api/folderSize", async (req, res) => {
  res.send({ data: folderSizePath });
});

app.get("/api/getshop", async (_req, res) => {
  const countData = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  let isStatus = false;
  let isStatus2 = false;
  let newId;
  const newUrl = `https://${res.req.rawHeaders[1]}/api/webhooks`
  const getAllWebhook = await shopify.api.rest.Webhook.all({ session: res.locals.shopify.session });
  const fulfillmentData = getAllWebhook.filter((item) => {
    if (item.topic === 'fulfillments/create' && item.address !== newUrl) {
      newId = item.id
      isStatus = true
    }

    if (item.topic == 'fulfillments/create') {
      return true
    }

  })

  if (fulfillmentData.length === 0) {
    const webhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
    webhook.address = newUrl;
    webhook.topic = "fulfillment/create";
    webhook.format = "json";
    await webhook.save({
      update: true,
    });
  }

  if (isStatus) {
    const webhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
    webhook.id = newId
    webhook.address = newUrl;
    await webhook.save({
      update: true,
    });
  }

  const draftOrderData = getAllWebhook.filter((item) => {
    if (item.topic === 'draft_orders/update' && item.address !== newUrl) {
      newId = item.id
      isStatus2 = true
    }

    if (item.topic == 'draft_orders/update') {
      return true
    }

  })

  if (draftOrderData.length === 0) {
    const webhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
    webhook.address = newUrl;
    webhook.topic = "draft_orders/update";
    webhook.format = "json";
    await webhook.save({
      update: true,
    });
  }

  if (isStatus2) {
    const webhook = new shopify.api.rest.Webhook({ session: res.locals.shopify.session });
    webhook.id = newId
    webhook.address = newUrl;
    await webhook.save({
      update: true,
    });
  }
  res.status(200).send({ countData });
})

function orderStatusFunc(data) {
  db.query("UPDATE Quotes SET quote_order_id= " + data.order_id + ", quote_update_time=CURRENT_TIMESTAMP WHERE quote_draft_order_id=" + data.id + "", (err, results) => {
    if (err) {
      console.log("err", err)
    } else {
      console.log("Data Updated Successfully")
    }
  })

  let orderStatus = "Order Placed";
  if (data.status === "success") {
    db.query("UPDATE Quotes SET status= '" + orderStatus + "' WHERE quote_order_id=" + data.order_id + "", (err, results) => {
      if (err) {
        console.log("err", err)
      } else {
        console.log("Data Udated Successfully")
      }
    })
  }
}

app.post("/api/subscription/create", async (req, res) => {
  const recurring_application_charge = new shopify.api.rest.RecurringApplicationCharge({ session: res.locals.shopify.session });
  recurring_application_charge.name = `${req.body.plan}`;
  recurring_application_charge.test = true,

    recurring_application_charge.return_url = req.body.returnUrl;
  recurring_application_charge.price = req.body.price,
    recurring_application_charge.trial_days = 0;
  const data = await recurring_application_charge.save({
    update: true,
  });

  res.status(200).send({ data: recurring_application_charge, msg: "Get all data of this app  " });
})

app.get("/api/subscription/planstatus", async (req, res) => {
  const data = await shopify.api.rest.RecurringApplicationCharge.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send({ data: data });
})

app.get("/api/getPlanId", async (req, res) => {
  db.query("SELECT `plan_id`, `plan_name` FROM `Plan`", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: result, msg: "success" })
    }
  })
})

app.get("/api/subscription/cancel", async (req, res) => {
  const data = await shopify.api.rest.RecurringApplicationCharge.delete({
    session: res.locals.shopify.session,
    id: req.query.id,
  });
  res.status(200).send({ msg: "Subscription Cancelled" });
});

app.get("/api/plan/emailQuota", (req, res) => {
  db.query("SELECT * FROM `Plan` WHERE plan_name=" + req.query.planName + "", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ result: result, msg: "success" })
    }
  })
})

app.get("/api/plan", (req, res) => {
  db.query("SELECT * FROM `Plan` ", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ result: result, msg: "success" })
    }
  })
})

app.get("/api/app-metafield/delete", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });
  const data = await client.query({
    data: {
      "query": `mutation metafieldDelete($input: MetafieldDeleteInput!) {
        metafieldDelete(input: $input) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }`,
      "variables": {
        "input": {
          "id": _req.query.id
        }
      },
    }
  });
  res.status(200).send({ data: data, msg: "app-data-metafield deleted successfully " });
})

app2.get('/form/customFormFields', (req, res) => {
  db.query("SELECT * FROM CustomForm WHERE shopName='" + req.query.shopName + "'", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.json({ result: result, msg: "success" })
    }
  })
})

app.post('/api/customFormFields', async (req, res) => {
  db.query("SELECT * from CustomForm where shopName='" + req.body.shopName + "'", (err, result) => {
    if (err) {
      console.log("first", err)
    } else {
      if (result.length != 0) {
        db.query("UPDATE `CustomForm` SET `customForm`='" + req.body.customForm + "', xmlForm = '" + req.body.xmlForm + "' WHERE customForm_id= " + result[0].customForm_id + " ", (err, result) => {
          if (err) {
            console.log("first", err)
          } else {
            res.send({ msg: "form created successfully", type: "success" })
          }
        })
      } else {
        db.query("INSERT INTO `CustomForm`(`customForm`, `xmlForm`, `shopName`) VALUES ('" + req.body.customForm + "', '" + req.body.xmlForm + "','" + req.body.shopName + "')", (err, result) => {
          if (err) {
            console.log("first", err)
          } else {
            res.send({ msg: "form created successfully", type: "success" })
          }
        })
      }
    }
  })
})

app.get("/api/getCustomForm", async (req, res) => {
  db.query("SELECT * from CustomForm where shopName='" + req.query.shopName + "'", (err, result) => {
    if (err) {
      console.log("first", err)
    } else {
      res.status(200).send({ data: result });
    }
  })
})

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;
  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.get("/api/name", (req, res) => {
  db.query("SELECT COUNT(*) as count FROM Quotes WHERE shop_name=" + req.query.shop + "", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ result: result[0].count, msg: "success" })
    }
  })
})

app.get('/api/serachProducts', async (req, res) => {
  db.query("SELECT * FROM Quotes WHERE shop_name=" + req.query.shop + " ORDER BY Quotes.create_date DESC " + "", (err, results) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: results, msg: "success" })
    }
  })



  // const NameVar = JSON.parse(req.query.product_name)
  // db.query(`SELECT  AddQuotes.add_qoutes_id, created_at, AddQuotes.shop_name, user_data, AddQuotes.add_qoutes_id, product_name, product_image, product_variants FROM QuotesDetail INNER JOIN AddQuotes ON AddQuotes.add_qoutes_id =QuotesDetail.quotes_detail_id where AddQuotes.shop_name=${req.query.shop} AND product_name LIKE '%${NameVar}%'  LIMIT  ${req.query.firstPost}, ${req.query.listingPerPage} `, (err, results) => {
  //   if (err) {
  //     console.log("err", err)
  //   } else {
  //     console.log("res", results)
  //     res.send({ data: results, msg: "success" })
  //   }
  // })
})

app.get("/api/countFilter", async (req, res) => {
  let Newtoday = JSON.parse(req.query.value);
  let whereClause
  if (Newtoday === "today") {
    whereClause = `AND create_date = CURDATE()`
  }
  if (Newtoday === "yesterday") {
    whereClause = `AND create_date = CURDATE() -1`
  }
  if (Newtoday === "month") {
    whereClause = `AND create_date BETWEEN   SUBDATE(DATE_FORMAT(CURDATE(), "%y/%m/%d"), INTERVAL 1 MONTH ) AND DATE_FORMAT(CURDATE(), "%y/%m/%d")`
  }
  if (Newtoday === "lastWeek") {
    whereClause = `AND create_date BETWEEN   SUBDATE(DATE_FORMAT(CURDATE(), "%y/%m/%d"), INTERVAL 7 DAY ) AND DATE_FORMAT(CURDATE(), "%y/%m/%d")`
  }
  console.log("aaaaaaaaaaaaaaaa", "SELECT COUNT(*)  as count FROM `Quotes` WHERE shop_name =" + req.query.shopName + " " + whereClause + "")
  db.query("SELECT COUNT(*)  as count FROM `Quotes` WHERE shop_name =" + req.query.shopName + " " + whereClause + "", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: result, msg: "success" })
    }
  })
})

app2.get('/prod/productstats', async (req, res) => {
  const data = db.query("SELECT COUNT(*) as count FROM `ProductStats` WHERE product_id = '" + req.query.productId + "' ", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      db.query("SELECT * FROM `ProductStats` WHERE product_id = '" + req.query.productId + "' ", (err, result2) => {
        if (err) {
          console.log("err", err)
        } else {
          res.send({ count: result, result: result2 })
        }
      })
    }
  })
})

app2.post("/qoutes/insertproduct", async (req, res) => {
  let convData = req.body.convData;
  let conV = 0;
  db.query("INSERT INTO `ProductStats`(`shop_name`, `product_id`, `product_name`, `views`, `clicks`, `conversions`) VALUES ('" + req.body.shopName + "' ,'" + req.body.productId + "','" + req.body.productName + "','" + convData.isView + "','" + convData.isClick + "','" + conV + "')", (err, result) => {
    if (err) {
      console.log("first", err)
    } else {
      res.send("ok")
    }
  })
})

app2.post("/quotes/updateproduct", (req, res) => {
  const views = parseInt(req.body.view)
  const clicks = parseInt(req.body.click)
  const conversions = parseInt(req.body.conversion)
  let whereClause = "";
  if ("modalview" === req.body.modalview) {
    whereClause = 'views=' + views + ',clicks=' + clicks + ''
  }
  if ("modalsubmit" === req.body.modalsubmit) {
    whereClause = 'conversions=' + conversions + ''
  }
  const updateData = db.query("UPDATE `ProductStats` SET " + whereClause + " WHERE product_stats_id = " + req.body.productId + " AND shop_name = '" + req.body.shopName + "'", (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.send("success")
    }
  }
  )
})

app.get("/api/userDetail", (req, res) => {
  db.query("SELECT * FROM AddQuotes WHERE shop_name = " + JSON.stringify(req.query.shop) + "  AND product_id= " + JSON.stringify(req.query.product_id) + " ", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: result })
    }
  })
})

app.get("/api/product/productList", async (req, res) => {
  console.log("dddddddddd", req.query.shopName)
  db.query("SELECT * FROM `ProductStats` where shop_name=" + req.query.shopName + "ORDER BY product_name ASC" + " LIMIT " + req.query.firstPost + ", " + req.query.listingPerPage + "", (err, results) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: results, msg: "success" })
    }
  })
})

app.get("/api/chartFilter", async (req, res) => {
  let Newtoday = JSON.parse(req.query.value);
  let whereClause
  if (Newtoday === "today") {
    whereClause = `AND create_date BETWEEN SUBDATE( DATE_FORMAT(CURDATE(), "%y%m%d"), INTERVAL 1 MONTH) AND DATE_FORMAT(CURDATE(), "%y%m%d") GROUP BY create_date ORDER BY create_date ASC`
  }
  if (Newtoday === "month") {
    whereClause = `AND create_date> now() - INTERVAL 12 month GROUP by DATE_FORMAT(create_date, '%M') ORDER by create_date ASC;`
  }
  db.query("SELECT  create_date, count(create_date) as count FROM `Quotes` WHERE shop_name =" + req.query.shopName + " " + whereClause + "", (err, result) => {
    if (err) {
      console.log("err", err)
    }
    else {
      res.send({ data: result, msg: "success" })
    }
  })
})

app.get("/api/quoteList", async (req, res) => {
  db.query("SELECT * FROM Quotes WHERE shop_name=" + req.query.shop + " ORDER BY Quotes.create_date DESC " + " LIMIT " + req.query.firstPost + "," + req.query.listingPerPage + "", (err, results) => {
    if (err) {
      console.log("err", err)
    } else {
      if (results.length > 0) {
        res.send({ data: results, msg: "success" })
      }
    }
  })
})

app.get("/api/csvData", async (req, res) => {
  db.query("SELECT * FROM Quotes WHERE shop_name=" + req.query.shop + " ORDER BY Quotes.create_date DESC " + "", (err, results) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: results, msg: "success" })
    }
  })
})

app.get("/api/editQuote", async (req, res) => {
  db.query(
    "SELECT Quotes.quote_id, Quotes.user_data, Quotes.status, Quotes.total_order_amount, Quotes.total_products, Quotes.quote_update_time, Quotes.remarks, QuotesDetail.quote_detail_id, QuotesDetail.product_name, QuotesDetail.product_image, QuotesDetail.variants, QuotesDetail.variants_id, QuotesDetail.quantity, QuotesDetail.price, QuotesDetail.product_handle FROM Quotes INNER JOIN QuotesDetail ON Quotes.quote_id = QuotesDetail.quote_id WHERE Quotes.quote_id = " + req.query.quoteId,
    (err, results) => {
      if (err) {
        console.log("err", err);
      } else {
        res.send({ data: results, remarksData: results[0].remarks, msg: "success" });
      }
    }
  );
})

app.get("/api/saveQuote", async (req, res) => {
  let totalQuantity = 0;
  let totalPrice = 0;
  let finalRemarks = "";
  let quoteId = null;
  let newUpdatedData = JSON.parse(req.query.updatedData);
  let newDeletedIds = JSON.parse(req.query.deletedQuoteIds)

  for (let i = 0; i < newUpdatedData.length; i++) {
    let item = newUpdatedData[i];
    let quantity = parseInt(item.quantity, 10);
    let price = parseFloat(item.price);
    finalRemarks = item.remarks;
    quoteId = item.quote_id;

    if (!isNaN(totalQuantity) && !isNaN(price)) {
      totalQuantity += quantity;
      totalPrice += quantity * price;
    } else {
      console.error("Invalid quantity or price:", item);
    }
  }

  // if (newDeletedIds.length !== 0) {
  // for (let i = 0; i < newDeletedIds.length; i++) {
  //   db.query("DELETE FROM `QuotesDetail` WHERE quote_detail_id=" + newDeletedIds[i] + "", (err, result) => {
  //     if (err) {
  //       console.log("err")
  //     } else {

  //       if (i === newDeletedIds.length - 1) {
  //         updateInQuotes()
  //       }
  //     }
  //   })
  // }
  // } else {
  // updateInQuotes()
  // }

  // function updateInQuotes() {
  db.query("UPDATE Quotes SET total_order_amount=" + totalPrice + ", total_products=" + newUpdatedData.length + ", quote_update_time=CURRENT_TIMESTAMP, remarks='" + finalRemarks + "' WHERE Quotes.quote_id=" + quoteId + "", (err, results) => {
    if (err) {
      console.log("err", err)
    } else {
      if (newUpdatedData.length !== 0) {
        for (let i = 0; i < newUpdatedData.length; i++) {
          db.query("UPDATE QuotesDetail SET quantity=" + newUpdatedData[i].quantity + ", price=" + newUpdatedData[i].price + " WHERE quote_detail_id=" + newUpdatedData[i].quote_detail_id + "", (err, results) => {
            if (err) {
              console.log("err", err)
            } else {
              console.log("Data Updated Successfully")
            }
          })
        }
      }
      res.send({ data: results, msg: "success" })
    }
  })
  // }
})

app.get("/api/deleteCustomForm", async (req, res) => {
  try {
    const client = await shopify.api.rest.Shop.all({
      session: res.locals.shopify.session,
    });
    let shopName = client[0].name;
    db.query(" DELETE FROM `CustomForm` WHERE `shopName` ='" + shopName + "'", (err, results) => {
      if (err) {
        console.log("err", err)
      } else {
        db.query("INSERT INTO `CustomForm`(`customForm`, `xmlForm`, `shopName`) VALUES (" + req.query.htmlForm + ", '" + req.query.xmlForm + "','" + shopName + "')", (err, result) => {
          if (err) {
            console.log("err", err)
          } else {
            res.send({ data: result, msg: "success" })
          }
        })
      }
    })
  } catch (err) {
    res.status(500).json({ err: 'An error occurred' });
  }
})

app.get("/api/remainingQuote", async (req, res) => {
  db.query("SELECT COUNT(*) as count FROM Quotes WHERE shop_name=" + req.query.shop + " AND create_date >= '" + req.query.startDate + "' AND create_date <= '" + req.query.lastDate + "'", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ result: result[0].count })
    }
  })
})

app.get('/api/quote_To_order', async (req, res) => {
  let newArr = JSON.parse(req.query.data)

  try {
    const draft_order = new shopify.api.rest.DraftOrder({ session: res.locals.shopify.session });
    draft_order.line_items = newArr,

      await draft_order.save({
        update: true,
      });

    db.query("UPDATE Quotes SET quote_draft_order_id=" + draft_order.id + ", quote_update_time=CURRENT_TIMESTAMP WHERE quote_id=" + req.query.quoteId + "", (err, results) => {
      if (err) {
        console.log("err", err)
      } else {
        res.send({ data: results, msg: "success" })
      }
    })
  } catch (error) {
    console.error('Error fetching draft orders:', error);
  };
})

app.get("/api/product/getproductstats", (req, res) => {
  db.query("SELECT COUNT(*) as count FROM `ProductStats` WHERE shop_name ='" + req.query.shopName + "' ", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: result })
    }
  })
})

app2.post("/quote/createquote", (req, res) => {
  let shop = req.body.shop;
  let UserArr = req.body.userArr;
  let entries;
  var totalQuantity = 0;
  var totalPrice = 0;

  console.log("UserArrUserArrUserArrUserArrUserArrUserArr", UserArr)
  for (let i = 0; i < req.body.detailArr_data.length; i++) {
    const element = JSON.parse(req.body.detailArr_data[i].variants);
    entries = Object.entries(element);

    var item = req.body.detailArr_data[i];
    var quantity = parseInt(item.quantity, 10);
    var price = parseFloat(item.price);
    if (!isNaN(quantity) && !isNaN(price)) {
      totalQuantity += quantity;
      totalPrice += quantity * price;
    } else {
      console.error("Invalid quantity or price:", item);
    }
  }

  db.query("INSERT INTO `Quotes`(`shop_name`,`user_data`,`total_order_amount`,`total_products`) VALUES ('" + shop.shop_name + "','" + UserArr + "','" + totalPrice + "','" + req.body.detailArr_data.length + "')", (err, result) => {
    if (err) {
      console.log("QuotesInsert if", err);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }

    let insertedQuotes = result.insertId;
    let insertedCount = 0;

    for (let i = 0; i < req.body.detailArr_data.length; i++) {
      db.query("INSERT INTO `QuotesDetail`(`quote_id`,`quantity`,`price`,`product_image`, `variants`, `variants_id`,`product_name`,`product_handle`) VALUES ('" + insertedQuotes + "','" + req.body.detailArr_data[i].quantity + "','" + req.body.detailArr_data[i].price + "','" + req.body.detailArr_data[i].image + "','" + req.body.detailArr_data[i].variants + "','" + req.body.detailArr_data[i].variantId + "','" + req.body.detailArr_data[i].title + "','" + req.body.detailArr_data[i].handle + "')", (err, result) => {
        if (err) {
          console.error("Error inserting into QuotesDetail:", err);
        } else {
          insertedCount++;
          if (insertedCount === req.body.detailArr_data.length) {
            sendEmailAndRespond();
          }
        }
      }
      );
    }
  });

  function sendEmailAndRespond() {
    const currentDate = new Date();
    const formattedDateTime = `${currentDate.getDate().toString().padStart(2, '0')}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;


    let message = "";
    entries.map(([key, val] = entry) => {
      return message += `<span ><b>${key}</b> : ${val} </span> `;
    });
    let divTag = "";

    JSON.parse(UserArr).map((item, index) => {
      const key = Object.keys(item)[0];
      const value = Object.values(item)[0];
      return (
        divTag += `<div style="margin-left:38px" key=${index}>${key}: ${value}</div>`
      )
    })

    db.query("SELECT * FROM EmailSMTP WHERE shop_name='" + shop.shop_name + "'", (err, result) => {
      console.log("check EMAIL SMTP result", result);
      if (err) {
        console.log("err", err);
        return res.status(500).json({
          status: "error",
          message: "Internal Server Error",
        });
      } else {
        let transporter = nodemailer.createTransport({
          host: result[0].smtp_server,
          port: result[0].port,
          secure: false,
          auth: {
            user: result[0].user_email,
            pass: result[0].password
          },
        });

        let content = ""
        content += `<div style="width:700px;margin:auto;">
          <div>
            <table style="width:100%;max-width:100%;margin-bottom:20px;font-size:16px;background:#00387f">
              <thead>
                <tr>
                  <th style="text-align:left">
                    <div style="padding:15px">
                      <div style="max-height:60px;max-width:100px;margin-right:auto">
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style="margin:0 12px;color:#ffffff;text-align:center">
                      <h2>Request a quote - Company Name</h2>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="padding:15px;background:#fbfbfb">
            <div>
              <table style="width:100%;max-width:100%;margin:20px 0;font-size:16px">
                <tbody>
                  <tr>
                    <td>
                      <div style="display:flex">
                        <img src="https://img.icons8.com/?id=3225&format=png"
                          style="  width: 21px; height: 21px" alt="">
                          <span style="margin-left:15px">CUSTOMER INFORMATION</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style="margin-left:38px">Create At: ${formattedDateTime}</div>
                      ${divTag}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div style="font-size:18px;margin-top:24px">
              Quote form information:
            </div>`

        {
          req.body.detailArr_data.map((data, i) => {
            content += `<div style="background:#fff;padding:10px">
                <table style="width:100%;max-width:100%;margin-bottom:20px;font-size:16px">
                  <tbody>
                    <tr>
                      <td style="border-top:1px solid #f1f1f6">
                        <div style="display:flex">
                          <img src='${data.image}' alt='${data.image}'
                            style="max-width:120px;padding:15px 15px 15px 0">
                            <div>
                              <p style="font-weight:600">${data.title}</p>
                              ${message}
                            </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>`
          })
        }

        content += `</div>
        </div>`

        transporter.sendMail({
          headers: {
            From: result[0].user_email,
            // To: shop.admin_email,
            To: "rajeev.webframez@gmail.com",
            Subject: shop.subject,
          },
          html: content
        });

        res.status(200).json({
          status: "success",
          message: "Data Saved Successfully",
        });
      }
    });
  }
});

app.post("/api/testemail", async (_req, res) => {
  let request = _req.body
  db.query("SELECT *  FROM EmailSMTP WHERE shop_name='" + _req.body.shopName + "' ", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      let transporter = nodemailer.createTransport({
        host: result[0].smtp_server,
        port: result[0].port,
        secure: false,
        auth: {
          user: result[0].user_email,
          pass: result[0].password
        },
      });

      transporter.sendMail({
        headers: {
          From: request.email,
          To: "rajeev.webframez@gmail.com",
          Subject: request.subject,
        },
        html: `
        <div style="width:700px;margin:auto;">
        <div>
          <table style="width:100%;max-width:100%;margin-bottom:20px;font-size:16px;background:#00387f">
            <thead>
              <tr>
                <th style="text-align:left">
                  <div style="padding:15px">
                    <div style="max-height:60px;max-width:100px;margin-right:auto">
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style="margin:0 12px;color:#ffffff;text-align:center">
                    <h2>This is a Test Email</h2>
                    <h2>Request a quote - Company Name</h2>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="padding:15px;background:#fbfbfb">
          <div>
            <table style="width:100%;max-width:100%;margin:20px 0;font-size:16px">
              <tbody>
                <tr>
                  <td>
                    <div style="display:flex">
                      <img src="https://img.icons8.com/?id=3225&format=png" style="width: 21px; height: 21px" alt="">
                        <span style="margin-left:15px">CUSTOMER INFORMATION</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style="margin-left:38px">Created At: ${request.date}</div>
                    <div style="margin-left:38px">Name: ${request.name}</div>
                    <div style="margin-left:38px">Email: <a href="mailto:${request.email}" target="_blank">request.email</a></div>
                    <div style="margin-left:38px">Mob: ${request.number}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table style="width:100%;max-width:100%;margin:20px 0;font-size:16px">
              <tbody>
                <tr>
                  <td>
                    <div>
                      <img src="https://img.icons8.com/?id=49&format=png" alt="" style="width: 21px; height: 21px" />
                      <span style="margin-left:15px">QUOTE MESSAGE</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style="font-size:16px;margin-left:38px " > ${request.msg} </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table style="width:100%;max-width:100%;margin:20px 0;font-size:16px">
              <tbody>
                <tr>
                  <td>
                    <img src=${edit} alt="" style="width: 21px; height: 21px" />
                    <span style="margin-left:15px">Product Information:</span>
                  </td>
                </tr>
                <tr>
                  <td style="border-top:1px solid #f1f1f6">
                    <div style="display:flex">
                      <div>
                        <img src="https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*" alt="image-product" style="max-width:120px;padding:15px 15px 15px 0" class="CToWUd" data-bit="iit" />
                        <p style="font-weight:600">Clay Plant Pot</p>
                        <span><b>Size</b> : Regular </span> <span><b>Color</b> : Red </span> </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
        `
      }).then(res.send({ msg: "success" }))
        .catch(err => {
          console.log("console_check", err);
        });
    }
  })
})

app.get("/api/app-metafield/get-id", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });
  const data = await client.query({
    data: `
      query {
          currentAppInstallation {
          id
        }
      }`
  });
  res.status(200).send({ data: data, msg: "Get id of app metafield " });
});

app.post("/api/app-metafield/create", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });
  let ourData = await useMetafields(_req.body);
  const data = await client.query({
    data: ourData,
  });
  res.status(200).send({ data: data, status: "success", msg: "Data is saved successfully" });
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;
  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.post("/api/emailSMTP_data", async (req, res) => {
  db.query("INSERT INTO EmailSMTP ( driver, smtp_server, user_email, password, port, from_email, shop_name) VALUES ('" + req.body.driver + "','" + req.body.smtp_server + "','" + req.body.user_email + "','" + req.body.password + "','" + req.body.port + "','" + req.body.from_email + "','" + req.body.shop_name + "')", (err, results) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: results, msg: "success" })
    }
  })
})

app.get("/api/app-metafield/get-all", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });

  const data = await client.query({
    data: `
      query {
          app {
          id
          installation {
            metafields(first: ${15}) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
      }
    }`
  });

  res.status(200).send({ data: data, msg: "Get all data of this app" });
});

global.localStorage = new LocalStorage('./scratch');
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  domain = JSON.stringify(res.req.rawHeaders[1])
  localStorage.setItem('myFirstKey', res.req.rawHeaders[1]);
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.post("/quotes/productstatus", (req, res) => {
  const data = db.query("SELECT * FROM `ProductStats` WHERE product_id='" + req.body.productId + "' AND shop_name='" + req.body.shopName + "'", (err, result) => {
    if (err) {
      console.log("first", err)
    } else {
      res.send({ data: result, msg: "success" })
    }
  })
})

app.post("/quotes/productstatus", (req, res) => {
  const data = db.query("INSERT INTO `ProductStats`(`shop_name`, `product_id`, `product_name`, `product_variants`, `views`, `clicks`, `conversions`) VALUES ('[value-2]','[value-3]','[value-4]','[value-5]','[value-6]','[value-7]','[value-8]')", (err, result) => {
    if (err) {
      console.log("first", err)
    } else {
      res.send("ok")
    }
  })
})

export { orderStatusFunc };

app.listen(PORT, () => {
  console.log("Started server on PORT");
});

app2.listen(PORT2, () => {
  console.log("Started server on PORT2");
});