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
import createAppDataMetafields from './appDataMetaFild.js'
import defaultMetafieldSetup from "./defaultMetaFieldSetup.js";

// console.log("appLoadId",sessionStorage.getItem("appLoadId"))

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

const customFormData = `<div class="rendered-form"><div class="formbuilder-text form-group field-name"><label for="name" class="formbuilder-text-label">Name</label><input type="text" placeholder="" class="form-control" name="name" id="name"></div><div class="formbuilder-text form-group field-email"><label for="email" class="formbuilder-text-label">Email</label><input type="email" placeholder="" class="form-control" name="email" id="email"></div><div class="formbuilder-textarea form-group field-textarea"><label for="message" class="formbuilder-textarea-label">Message</label><textarea placeholder="" class="form-control" name="textarea"id="textarea"></textarea></div><div class="formbuilder-button form-group field-button"><button type="submit" class="btn-primary btn" name="button" style="primary" id="button">Submit</button></div></div> `

const xmlFormData = `[{"type":"text","label":"Name","className":"form-control","name":"name","access":false,"subtype":"text"},{"type":"text","subtype":"email","label":"Email","className":"form-control","name":"email","access":false},{"type":"textarea","label":"Message","className":"form-control","name":"textarea","access":false,"subtype":"textarea"},{"type":"button","subtype":"submit","label":"Submit","className":"btn-primary btn","name":"button","access":false,"style":"primary"}]`

const myInstallationFxn = async (_req, res, next) => {
  const client = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  let shopName = client[0].name;
  // console.log("shopname2222222222", "INSERT INTO CustomForm(customForm, xmlForm, shopName) VALUES (" + customFormData + ", '" + xmlFormData + "','" + shopName + "'")
  db.query("INSERT INTO `CustomForm`(`customForm`, `xmlForm`, `shopName`) VALUES ('" + customFormData + "', '" + xmlFormData + "','" + shopName + "')", (err, result) => {
    if (err) {
      console.log("first", err)
    }
  })
  next()
}



const basketInstallationFxn = async (_req, res, next) => {
  let theme = await shopify.api.rest.Theme.all({
    session: res.locals.shopify.session,
  });
  let themeId;
  // @ts-ignore
  for (var i = 0; i < theme.length; i++) {
    if (theme[i].role === "main") {
      themeId = theme[i].id;
    }
  };
  
    // ----------------------this is to create a basket page----------------------
    const basketData = new shopify.api.rest.Asset({ session: res.locals.shopify.session });
    basketData.theme_id = themeId;
    basketData.key = "templates/page.basketQoute.liquid";
    basketData.value = "{{ page.content }}";
    await basketData.save({
      update: true,
    });
  
    const basketPage = new shopify.api.rest.Page({ session: res.locals.shopify.session });
    basketPage.title = "Basket";
    basketPage.template_suffix = "basketQoute";
    basketPage.handle = "basket-qoute";
    basketPage.body_html = `<div>
            <div class="wishlist-page-main page-width">
              <span class="shared-page-heading"></span>
            </div>
            <div class="show-shared-wishlist"> Loading............ </div>
            <p class="powered-by-text">Powered by<span>Web Framez Pvt. Ltd.</span></p>
        <script>   
            setTimeout(() => {
              basketDivFunction();
            }, [2000])
        </script>
    </div> `;
    await basketPage.save({
      update: true,
    });
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
  [shopify.auth.callback(), myInstallationFxn,basketInstallationFxn, setDefaultDataForApp],
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
  // dataaa(_req,res)
  const countData = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send({ countData });
})

app.get("/api/subscription/get-all", async (_req, res) => {
  try {
    const client = await new shopify.api.clients.Graphql({
      session: res.locals.shopify.session
    });

    let hasNextPage = true;
    let cursor = null;
    let allSubscriptions = [];

    while (hasNextPage) {
      const data = await client.query({
        data: `query {
          currentAppInstallation {
            allSubscriptions(first: 75, after: ${cursor ? `"${cursor}"` : null}) {
              edges {
                cursor
                node {
                  lineItems {
                    plan {
                      pricingDetails {
                        __typename
                        ... on AppRecurringPricing {
                          price {
                            amount
                            currencyCode
                          }
                        }
                        ... on AppUsagePricing {
                          balanceUsed {
                            amount
                            currencyCode
                          }
                          cappedAmount {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                  createdAt
                  id
                  name
                  status
                  test
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }`,
      });
      const subscriptions = data.body.data.currentAppInstallation.allSubscriptions.edges;
      allSubscriptions = allSubscriptions.concat(subscriptions);
      hasNextPage = data.body.data.currentAppInstallation.allSubscriptions.pageInfo.hasNextPage;
      cursor = data.body.data.currentAppInstallation.allSubscriptions.pageInfo.endCursor;
    }

    res.status(200).send({ data: allSubscriptions, msg: "Get all data of this app" });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).send({ msg: "Internal server error" });
  }
});

app.get("/api/subscription/cancel", async (req, res) => {
  const data = await shopify.api.rest.RecurringApplicationCharge.delete({
    session: res.locals.shopify.session,
    id: req.query.id,
  });
  res.status(200).send({ msg: "Subscription Cancelled" });
});
app.get('/api/qoute_To_order', async (req, res) => {
  let newArr = []
  newArr.push(req.query.data)
  const objects = [];
  JSON.parse(newArr).forEach(obj => {
    objects.push(obj);
  });

  const draftOrderData = {
    draft_order: {
      line_items:
        objects
    }
  }

  fetch(req.query.url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": req.query.token,
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(draftOrderData)
  })
    .then((response) => response.json())
    .then((data) => {
      res.send({ data: data.draft_order.invoice_url })
    })
    .catch((error) => {
      console.error('Error fetching draft orders:', error);
    });
})

app.get('/api/orders_status', async (req, res) => {
  const ACCESS_TOKEN = req.query.token;
  const shopDomain = req.query.domain;
  try {
    const apiUrl = `https://${shopDomain}/admin/api/2023-07/orders.json?status=any`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/api/order_fulfillments', async (req, res) => {
  // const apiKey = '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';
  // const shopDomain = 'rajeev-webframez.myshopify.com';
  let newId_Data = JSON.parse(req.query.id_Data);
  const results = [];
  try {
    for (let i = 0; i < newId_Data.length; i++) {
      const apiUrl = `https://${req.query.domain}/admin/api/2023-07/orders/${newId_Data[i]}/fulfillments.json`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': req.query.token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      results.push(result);
    }
    res.send(JSON.stringify(results));
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
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

app.get('/api/serachProducts', async (req, res) => {
  const NameVar = JSON.parse(req.query.product_name)
  db.query(`SELECT  AddQuotes.add_qoutes_id, created_at, AddQuotes.shop_name, user_data, AddQuotes.add_qoutes_id, product_name, product_image, product_variants FROM QuotesDetail INNER JOIN AddQuotes ON AddQuotes.add_qoutes_id =QuotesDetail.quotes_detail_id where AddQuotes.shop_name=${req.query.shop} AND product_name LIKE '%${NameVar}%'  LIMIT  ${req.query.firstPost}, ${req.query.listingPerPage} `, (err, results) => {
    if (err) {
      console.log("err", err)
    } else {
      console.log("res", results)
      res.send({ data: results, msg: "success" })
    }
  })
})

app.get("/api/name", (req, res) => {
  db.query("SELECT COUNT(*) as count FROM QuotesDetail WHERE shop_name=" + req.query.shop + "", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ result: result[0].count, msg: "success" })
    }
  })
})

app.get("/api/searchTotalRecord", (req, res) => {
  const NameVar = JSON.parse(req.query.product_name)
  console.log("name", NameVar)
  db.query(`SELECT COUNT(*) as count FROM QuotesDetail INNER JOIN AddQuotes ON AddQuotes.add_qoutes_id =QuotesDetail.quotes_detail_id where AddQuotes.shop_name=${req.query.shop} AND product_name LIKE '%${NameVar}%'`, (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      console.log("result", result)
      res.send({ result: result[0].count, msg: "success" })
    }
  })
})

app.post("/api/subscription/create", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });
  const data = await client.query({
    data: {
      "query": `mutation appSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $test: Boolean, $trialDays: Int) {
        appSubscriptionCreate(name: $name, lineItems: $lineItems, returnUrl: $returnUrl, test: $test, trialDays: $trialDays) {
          appSubscription {
            id
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }`,
      "variables": {
        "name": `${_req.body.plan}`,
        "test": true,
        "returnUrl": _req.body.returnUrl,
        "lineItems": [_req.body.data],
        "trialDays": 0
      },
    },
  });

  res.status(200).send({ data: data, msg: "Get all data of this app  " });
})

app.get("/api/subscription/planstatus", async (req, res) => {
  const data = await shopify.api.rest.RecurringApplicationCharge.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send({ data: data });
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
  let viewsVal = 1
  let conV = 0
  db.query("INSERT INTO `ProductStats`(`shop_name`, `product_id`, `product_name`, `views`, `clicks`, `conversions`) VALUES ('" + req.body.shopName + "' ,'" + req.body.productId + "','" + req.body.productName + "','" + viewsVal + "','" + viewsVal + "','" + conV + "')", (err, result) => {
    if (err) {
      console.log("first", err)
    } else {
      res.send("ok")
    }
  })
})

app2.post("/quotes/updateproduct", (req, res) => {
  const views = parseInt(req.body.view) + 1
  const clicks = parseInt(req.body.click) + 1
  const conversions = parseInt(req.body.conversion) + 1
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
  db.query("SELECT * FROM Quotes WHERE shop_name = " + JSON.stringify(req.query.shop) + "  AND product_id= " + JSON.stringify(req.query.product_id) + " ", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: result })
    }
  })
})

app.get("/api/product/productList", async (req, res) => {
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
  console.log("req.query", req.query)
  db.query("SELECT  * FROM `QuotesDetail`where shop_name=" + req.query.shop + "ORDER BY product_name ASC" + " LIMIT " + req.query.firstPost + ", " + req.query.listingPerPage + "", (err, results) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: results, msg: "success" })
    }
  })
})

app.get("/api/quoteList_withoutPagination", async (req, res) => {
  db.query("SELECT  * FROM `QuotesDetail`where shop_name=" + req.query.shop + "ORDER BY quotes_detail_id ASC" + " ", (err, results) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ data: results, msg: "success" })
    }
  })
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

  // db.query("SELECT  * FROM `QuotesDetail`where shop_name=" + req.query.shop + "ORDER BY quotes_detail_id ASC" + " ", (err, results) => {
  //   if (err) {
  //     console.log("err", err)
  //   } else {
  //     res.send({ data: results, msg: "success" })
  //   }
  // })
})

// app.get("/api/csvData", async (req, res) => {
//   console.log("csvData shop", JSON.parse(req.query.shop))
//   db.query("SELECT * FROM `QuotesDetail`where shop_name=" + req.query.shop + "  ORDER BY product_name ASC ", (err, results) => {
//     if (err) {
//       console.log("err", err)
//     } else {
//       res.send({ data: results, msg: "success" })
//     }
//   })
// })

app.get("/api/remainingQuote", async (req, res) => {
  db.query("SELECT COUNT(*) as count FROM Quotes WHERE shop_name=" + req.query.shop + " and create_date >= '" + req.query.startDate + "' and create_date <= '" + req.query.lastDate + "'", (err, result) => {
    if (err) {
      console.log("err", err)
    } else {
      res.send({ result: result[0].count })
    }
  })
})

app.get("/api/update_order_Status", (req, res) => {
  let newArr = [];
  newArr.push(req.query.data);
  let NewData = JSON.parse(newArr[0]);
  if (NewData.length !== 0) {
    for (let i = 0; i < NewData.length; i++) {
      let order = "Order Placed";
      // db.query("UPDATE QuotesDetail SET product_status = ? WHERE product_variant_id = ?", [order, NewData[i].product_id]);
      db.query("UPDATE QuotesDetail SET product_status='" + order + "' , product_status_time='" + NewData[i].status_time + "' WHERE product_variant_id ='" + NewData[i].product_id + "' ");
    }
    res.send("ok");
  } else {
    res.status(404).send("No data to update");
  }
});

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
console.log("UserArr",UserArr)
  var totalQuantity = 0;
  var totalPrice = 0;

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
      db.query("INSERT INTO `QuotesDetail`(`qoute_id`,`quantity`,`price`,`product_image`, `variants`, `variants_id`,`product_name`) VALUES ('" + insertedQuotes + "','" + req.body.detailArr_data[i].quantity + "','" + req.body.detailArr_data[i].price + "','" + req.body.detailArr_data[i].image + "','" + req.body.detailArr_data[i].variants + "','" + req.body.detailArr_data[i].variantId + "','" + req.body.detailArr_data[i].title + "')", (err, result) => {
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
            From: "mukeshkumar.webframez@gmail.com",
            To: 'mukeshkumar.webframez@gmail.com',
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
    }
    else {
      let transporter = nodemailer.createTransport({
        // host: "smtp-relay.sendinblue.com",
        // port: 587,
        host: result[0].smtp_server,
        port: result[0].port,
        secure: false,
        auth: {
          // user: "gurmeet.webframez@gmail.com",
          // pass: "I5CNfgOPp6twxM19",
          user: result[0].user_email,
          pass: result[0].password
        },
      });

      transporter.sendMail({
        headers: {
          From: request.email,
          To: "mukeshkumar.webframez@gmail.com",
          // To: "rajeev.webframez@gmail.com",
          Subject: request.subject,
          // To: request.email,
          // Subject: request.subject,
        },
        html: `<div style="width:700px;margin:auto;">
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
                                <img src="https://img.icons8.com/?id=3225&format=png" style="  width: 21px; height: 21px" alt="" >
                                    <span style="margin-left:15px">CUSTOMER INFORMATION</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                        <div style="margin-left:38px">Created At: ${request.date}</div>
                            <div style="margin-left:38px">Name: ${request.name}</div>
                            <div style="margin-left:38px">Email: <a href="mailto:${request.email} target="_blank">${request.email}</a></div>
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
                <img src="https://img.icons8.com/?id=49&format=png" alt="" style="width: 21px; height: 21px"  >
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
                    <img src="https://img.icons8.com/?id=2bMQJZQif7nl&format=png" alt="" style="width: 21px; height: 21px"  >
                    <span style="margin-left:15px">Product Information:</span>
                </td>
            </tr>
          <tr>
            <td style="border-top:1px solid #f1f1f6">
            <div style="display:flex">
            <img src="https://ci6.googleusercontent.com/proxy/OtfvSwk5q_LWT6OGQiRziN4fCKFUFK-w2h0IIQVnOZ8kX0fSg4Ko9mIG8sqChDd8_voBT9hsiggjm7haI5kyqA1floLRW-dH3izG7vGWKfG8VPUGPowfHt2bNewmwO9kP56DmD0X2Gv7qhAcHe3NRMiRe6jE8OymMGPJ9OXdFF3YcH3fE2PYbJqSCZ9QQhXj2A=s0-d-e1-ft#https://cdn.shopify.com/s/files/1/0734/4072/3246/products/single-sprout-in-a-pot_925x_a26a8b11-9dc1-4c33-b5ee-577856930c3c.jpg" alt="image-product" style="max-width:120px;padding:15px 15px 15px 0" class="CToWUd" data-bit="iit">
                <div>
                    <p style="font-weight:600">Clay Plant Pot</p>
                    <span><b>Size</b> : Regular </span> <span><b>Color</b> : Red </span> </div>
        </div>
            </td>
        </tr>
        </tbody>
            </table>
      
            </div>
        </div>
    `
      }).then(res.send({ msg: "success" }))
        .catch(console.log("console_check"))
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

app.get("/api/appsubscription/get-all", async (_req, res) => {
  const client = await new shopify.api.clients.Graphql({
    session: res.locals.shopify.session
  });

  const data = await client.query({
    data: `query {
      currentAppInstallation {
        allSubscriptions(first: 50) {
          edges {
            node {
              id
              status
              lineItems {
                id
                usageRecords(first: 5) {
                  edges {
                    node {
                      id
                      description
                      createdAt
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `
  });

  res.status(200).send({ data: data, msg: "Get all data of this app  " });
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

app.listen(PORT, () => {
  console.log("Started server on PORT");
});

app2.listen(PORT2, () => {
  console.log("Started server on PORT2");
});