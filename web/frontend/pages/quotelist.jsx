



  import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useAuthenticatedFetch } from '../hooks'
import usePagination from '../hooks/usePagination'
import "./css/myStyle.css"
import { useLocation } from 'react-router-dom';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import { ViewMajor } from '@shopify/polaris-icons';
import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Button,
  Modal,
  Spinner,
  Icon,
  Text,
  Select
} from '@shopify/polaris';
import useApi from '../hooks/useApi';
import Papa from 'papaparse';

const QuoteList = () => {
  function convertArrayToCSV(dataArray) {
    const csv = Papa.unparse(dataArray);
    return csv;
  }

  function DownloadCSVButton({ dataArray }) {
    const handleDownload = () => {
      const csvString = convertArrayToCSV(dataArray);
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data.csv';
      link.click();
      URL.revokeObjectURL(url);
    };

    return (
      <span><Button onClick={handleDownload}>Download CSV</Button></span>
    );
  }

  let aa = ""
  const { search } = useLocation()
  const ShopApi = useApi()
  console.log("name",ShopApi)

  const shop = useRef();
  const [loading, setLoading] = useState(true)
  const ACCESS_TOKEN = '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';
  const searchParams = new URLSearchParams(search.trim());
  const [searchResults, setSearchResults] = useState("");
  const newFatch = useAuthenticatedFetch();
  let currentPage = searchParams.get('pagenumber')
  let navigate = "/quotelist/"
  const pagination = usePagination(currentPage, navigate)
  const [listingPerPage, setListingPerPage] = useState('5')
  const [totalRecord, setTotalRecord] = useState(0);
  const [data, setData] = useState([]);
  const [sdata, setSdata] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [withoutPagination, setWithoutPagination] = useState([])
  const paginationFunc = pagination.pagination(totalRecord, listingPerPage);
  const [modalObj, setModalObj] = useState({});
  let map = new Map();
  map.set("a", { val: paginationFunc.firstPost })
  map.get("a").val++
  let resultArray = [];
  console.log("test resultArray", resultArray)
  const selectOptions = [
    { label: 'Records Per Page(10)', value: '10' },
    { label: 'Records Per Page(20)', value: '20' },
    { label: 'Records Per Page(30)', value: '30' },
    { label: 'Records Per Page(50)', value: '50' },
    { label: 'Records Per Page(100)', value: '100' },
  ];


  useEffect(async () => {
    const shopApi = await ShopApi.shop();
    shop.current = shopApi;
    // await csvApi(shopApi);
    // await searchApi(shopApi);
    // const maindata = await orderStatusApi(shopApi);
    // await order_fulfillApi(maindata.data);
    // try {
    //   await newFatch(`/api/update_order_Status?data=${JSON.stringify(resultArray)}`);
    //   setLoading(false)
    // } catch (error) {
    //   console.error("Error:", error);
    // }

  }, [currentPage, loading])

  const csvApi = async (shop) => {
    console.log("shop test", shop)
    try {
      const response = await newFatch(`/api/csvData?shop=${shop.shopName}`);
      const result = await response.json();
      setCsvData(result.data)
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const searchApi = async (shop) => {
    if (searchResults != "") {
      console.log("yes")
      try {
        const response = await newFatch(`/api/searchTotalRecord?shop=${JSON.stringify(shop.shopName)}&&product_name=${JSON.stringify(searchResults)}`);
        const result = await response.json();
        setTotalRecord(result.result)
      } catch (error) {
        console.error("Error:", error);
      }
      try {
        const response = await newFatch(`/api/serachProducts?product_name=${JSON.stringify(searchResults)}&&shop=${JSON.stringify(shop.shopName)}&&listingPerPage=${JSON.parse(listingPerPage)}&&firstPost=${paginationFunc.firstPost}`);
        const result = await response.json();
        if (searchResults === "") {
          setData(sdata)
        } else {
          setData(result.data)
        }
      } catch (error) {
        console.error("Error:", error);
      }

    }
    else {
      try {
        const response = await newFatch(`/api/name?shop=${JSON.stringify(shop.shopName)}`);
        const result = await response.json();
        setTotalRecord(result.result)
      } catch (error) {
        console.error("Error:", error);
      }
      try {
        const response = await newFatch(`/api/quoteList?shop=${JSON.stringify(shop.shopName)}&&listingPerPage=${JSON.parse(listingPerPage)}&&firstPost=${paginationFunc.firstPost}`);
        const result = await response.json();
        setData(result.data)
        setSdata(result.data)
      } catch (error) {
        console.error("Error:", error);
      }


      try {
        const response = await newFatch(`/api/quoteList_withoutPagination?shop=${JSON.stringify(shop.shopName)}`);
        const result = await response.json();
        
        setWithoutPagination(result.data)
      } catch (error) {
        console.error("Error:", error);
      }

    }
  }

  const orderStatusApi = async (shop) => {
    try {
      const response = await newFatch(`/api/orders_status?token=${ACCESS_TOKEN}&&domain=${shop.domain}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return {
        data: data.orders
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const order_fulfillApi = async (dataDetail) => {
    const shopApi = await ShopApi.shop();
    console.log("dataDetailhhhhhhhh", shopApi)
    try {
      let id_data = []
      for (let i = 0; i < dataDetail.length; i++) {
        id_data.push(dataDetail[i].id)
      }
      const response = await newFatch(`/api/order_fulfillments?id_Data=${JSON.stringify(id_data)}&&token=${ACCESS_TOKEN}&&domain=${shopApi.domain}`);
      // const response = await newFatch(`/api/orders_status?token=${ACCESS_TOKEN}&&domain=${shop.domain}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      gg(data)
    } catch (error) {
      console.error("Error:", error);
    }
  }


  const gg = (dattaa) => {
    dattaa.forEach((entry) => {
      if (entry.fulfillments[0] && entry.fulfillments[0].status === "success") {
        let lineItems = [];
        lineItems.push(entry.fulfillments[0]);
        let aa;
        let bb;
        for (let i = 0; i < lineItems.length; i++) {
          aa = lineItems[i].line_items[0];
          bb = lineItems[i].created_at;
        }

        let dateObject = new Date(bb);
        let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        let formattedDate = dateObject.toLocaleDateString(undefined, options);

        let isConditionMet = false;
        withoutPagination.forEach((item) => {
          if (aa.variant_id === JSON.parse(item.product_variant_id)) {
            const exists = resultArray.some((resultItem) => resultItem.product_id === item.product_variant_id && item.product_status != "Order Placed");
            if (!exists) {
              resultArray.push({
                product_id: item.product_variant_id,
                status_time: formattedDate
              });
            }
            isConditionMet = true;
          }
        })

      }
    });
  }



  const newHandler = async (index, product_variant_id,) => {
 
    const apiUrl = `https://${shop.current.domain}/admin/api/2023-07/draft_orders.json`;
    let keyValuePairs = [
      {
        variant_id: product_variant_id,
        quantity: 1
      }
    ]
    let newCleanData = JSON.stringify(keyValuePairs);

    try {
      const response = await newFatch(`/api/qoute_To_order?data=${newCleanData}&&token=${ACCESS_TOKEN}&&url=${apiUrl}`);
      const result = await response.json();
      window.top.location.replace(result.data)
    } catch (error) {
      console.error("Error:", error);
    }
  }



  let aRR = []
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(data);
  let entries
  const all = (data) => {
    var db = data
    entries = Object.entries(db)
  }
  const rowMarkup = data.map(
    (
      {
        product_id,
        product_name,
        product_image,
        product_variants,
        user_data,
        product_variant_id,
        product_status,
        product_status_time,
      },
      index,
    ) => {
      all(product_variants);
      return (
        <IndexTable.Row id={product_id} key={product_id} position={index}>
          <IndexTable.Cell>{map.get("a").val++}</IndexTable.Cell>
          <IndexTable.Cell>{product_name}</IndexTable.Cell>
          <IndexTable.Cell>
            <img src={product_image} className='imgcss' alt={product_name} />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Button
              onClick={() => {
                handleChange(index, product_id);
                setModalObj({
                  entries,
                  product_image,
                  user_data,
                  product_name,
                  product_variants,
                });
              }}
            >
              <Icon source={ViewMajor} color="base" />
            </Button>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Button onClick={() => newHandler(index, product_variant_id)}>
              Convert Quote
            </Button>
          </IndexTable.Cell>
          <IndexTable.Cell>{product_status ? product_status : "Un-Ordered"}</IndexTable.Cell>
          <IndexTable.Cell>{product_status_time ? product_status_time : ''}</IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );


  const [active, setActive] = useState(false);
  const [user, setUser] = useState([]);

  const handleChange = async (index, product_id) => {
    setActive(!active);
    try {
      const encodedProductId = encodeURIComponent(product_id);
      const response = await newFatch(`/api/userDetail?shop=${shop.current.shopName}&product_id=${encodedProductId}`);
      const result = await response.json();

      result.data.map((item, i) => {
        aRR.push(JSON.parse(item.user_data))
      })
      setUser(aRR)
    } catch (error) {
      console.error("Error:", error);
    }

  }
  let userDataArray;
  if (modalObj.user_data != undefined) {
    userDataArray = JSON.parse(modalObj.user_data);
  }
  const searchHandle = async (e) => {
    try {
      const response = await newFatch(`/api/searchTotalRecord?shop=${JSON.stringify(shop.current.shopName)}&&product_name=${JSON.stringify(searchResults)}`);
      const result = await response.json();
      setTotalRecord(result.result)
    } catch (error) {
      console.error("Error:", error);
    }
    try {
      const response = await newFatch(`/api/serachProducts?product_name=${JSON.stringify(searchResults)}&&shop=${JSON.stringify(shop.current.shopName)}&&listingPerPage=${JSON.parse(listingPerPage)}&&firstPost=${paginationFunc.firstPost}`);
      const result = await response.json();
      if (searchResults === "") {
        setData(sdata)

      } else {
        setData(result.data)
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const searchHandle1 = (e) => {
    setSearchResults(e.target.value);
  }
  let mainVariant
  if (modalObj.product_variants != undefined) {
    let variantData = JSON.parse(modalObj.product_variants)
    mainVariant = Object.entries(variantData)
  }

  let keyValArr = []
  let uniquePairs = {};
  let result = [];

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const maindata = await orderStatusApi(shop.current);
      await order_fulfillApi(maindata.data);
      await update_Status_Api();
      setLoading(false)
    } catch (err) {
      return err;
    }
  }


  const handleSelectChange = useCallback(
    async (value) => {
      setLoading(true)
      setListingPerPage(value);
      setData([])
      await searchApi(shop.current);
      setLoading(false)
    },
    []
  );


  return (
    <>
      {loading ?
        <div className='spinnerStyle'>
          <Spinner accessibilityLabel="Small spinner example" size="large" />
        </div>
        :
        <div>
          {pagination.loading === true ?
            <div className='spinnerStyle'>
              <Spinner accessibilityLabel="Small spinner example" size="large" />
            </div>
            :
            <div>
              <span className="topHeading"><Text variant="heading2xl" as="h3" >Quote List</Text></span>
              <div className='quoteHeader'>
                <div className="searchBarStyle">
                  <input
                    type="text"
                    placeholder="Search"
                    onChange={searchHandle1}
                    value={searchResults}
                    onKeyUp={searchHandle}
                  />
                </div>

                <div className='buttonDiv'>
                  <span className='refreshButton'>
                    <Button onClick={handleRefresh}>Refresh</Button>
                  </span>

                  <LegacyCard>
                    <DownloadCSVButton dataArray={csvData} />
                  </LegacyCard>

                  <span className='recordSelect'>
                    <Select
                      labelInline
                      options={selectOptions}
                      onChange={handleSelectChange}
                      value={listingPerPage}
                    />
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '60px' }}>
                <LegacyCard>
                  <IndexTable
                    itemCount={data.length}
                    selectedItemsCount={
                      allResourcesSelected ? 'All' : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                      { title: 'Sr No.' },
                      { title: 'Product Name' },
                      { title: 'Product Image' },
                      { title: 'View' },
                      { title: 'Action' },
                      { title: 'Status' },
                      { title: 'Remarks' },
                    ]}
                    selectable={false}
                    style={{ position: 'fixed' }}
                  >
                    {rowMarkup}

                  </IndexTable>
                </LegacyCard>
              </div>
              <PaginationControl
                page={parseInt(pagination.currentPage)}
                total={totalRecord}
                limit={JSON.parse(listingPerPage)}
                changePage={(page) => {
                  pagination.pageChange(page)
                }}
              />
              <Modal
                large
                open={active}
                onClose={handleChange}
                title=""
              >
                <div className='modal_MainDiv'>
                  <div className='modal_ImgDiv'>
                    {<img src={modalObj.product_image} style={{ height: '100%', width: '100%' }} />}
                    <p className='modal_ProductName'><strong>{modalObj.product_name}</strong></p>
                  </div>

                  <div>
                    <div className='variant_Div'>
                      {mainVariant != undefined && mainVariant.map(([key, val] = entry) => {
                        return (<> <strong>{key}</strong>  : {val}  <br /></>);
                      })}
                    </div>

                    <div>
                      {user.map((data, index) => {
                        for (let i = 0; i < data.length; i++) {
                          let keys = Object.keys(data[i]);
                          let vals = Object.values(data[i]);
                          keyValArr.push({
                            key: keys[0],
                            val: vals[0]
                          })
                        }
                      })
                      }

                      {keyValArr.forEach(obj => {
                        const key = obj.key;
                        const val = obj.val;
                        const pairString = `${key}:${val}`;

                        if (!uniquePairs[pairString]) {
                          uniquePairs[pairString] = true;
                          result.push(obj);
                        }
                      })
                      }

                      {result.map((g, i) => {
                        return (
                          <>
                            <LegacyCard>
                              <strong>{g.key}</strong>  : {g.val}
                            </LegacyCard>
                          </>
                        );
                      })}

                    </div>
                  </div>
                </div>
              </Modal>
            </div>
          }
        </div>
      }
    </>
  )
}

export default QuoteList;
