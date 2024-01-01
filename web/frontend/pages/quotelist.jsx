import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthenticatedFetch } from '../hooks';
import usePagination from '../hooks/usePagination';
import "./css/myStyle.css";
import { useLocation } from 'react-router-dom';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import {
  IndexTable,
  LegacyCard,
  useIndexResourceState,
  Button,
  Spinner,
  Text,
  Select,
} from '@shopify/polaris';
import useApi from '../hooks/useApi';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import SmallSpinner from '../hooks/SmallSpinner';

const QuoteList = () => {
  let aa = "";
  const { search } = useLocation();
  const ShopApi = useApi();
  const shop = useRef();
  const [loading, setLoading] = useState(true);
  const searchParams = new URLSearchParams(search.trim());
  const [searchResults, setSearchResults] = useState("");
  const newFatch = useAuthenticatedFetch();
  let currentPage = searchParams.get('pagenumber');
  let navigate = "/quotelist/";
  let navigateSomewhere = useNavigate();
  const pagination = usePagination(currentPage, navigate);
  const [listingPerPage, setListingPerPage] = useState('10');
  const [totalRecord, setTotalRecord] = useState(0);
  const [data, setData] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const paginationFunc = pagination.pagination(totalRecord, listingPerPage);
  const [planId, setPlanId] = useState();
  let map = new Map();
  map.set("a", { val: paginationFunc.firstPost });
  map.get("a").val++;
  const getLocalListPerPage = localStorage.getItem("listPerPage") === null ? 10 : localStorage.getItem("listPerPage");
  let newArray = [];
  let filterIds = [];
  const selectOptions = [
    { label: 'Records Per Page(10)', value: '10' },
    { label: 'Records Per Page(20)', value: '20' },
    { label: 'Records Per Page(30)', value: '30' },
    { label: 'Records Per Page(50)', value: '50' },
    { label: 'Records Per Page(100)', value: '100' },
  ];
  const [smallLoading, setSmallLoading] = useState(false);
  const swtAltMsg = { title: "Successfully Created", text: "Draft Order has been created successfully", isSwtAlt: true, smallSpinner: setSmallLoading };
  const [indexLoading, setindexLoading] = useState();

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
      <span className={`${planId === 1 && 'disabledButton'}`}><Button onClick={handleDownload} disabled={planId ===1 && true}>Download CSV</Button></span>
    );
  }


  useEffect(async () => {
    const shopApi = await ShopApi.shop();
    const planId = await ShopApi.getCurrentPlan();
    setPlanId(planId.planId)
    setListingPerPage(getLocalListPerPage)
    shop.current = shopApi;
    await csvApi(shop.current);
    await listingDataApi(shop.current)
    setLoading(false)
  }, [currentPage, loading])

  const csvApi = async (shop) => {
    try {
      const response = await newFatch(`/api/csvData?shop=${JSON.stringify(shop.shopName)}`);
      const result = await response.json();
      setCsvData(result.data)
      setTotalRecord(result.data.length)
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const listingDataApi = async (shop) => {
    try {
      const response = await newFatch(`/api/quoteList?shop=${JSON.stringify(shop.shopName)}&&listingPerPage=${JSON.parse(listingPerPage)}&&firstPost=${paginationFunc.firstPost}`);
      const result = await response.json();
      setData(result.data)
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const editHandler = async (quote_id) => {
    navigateSomewhere(`/editquote?id=${quote_id}`)
  }

  const convertHandler = async (quote_id, index) => {
    setSmallLoading(true)
    data.filter((item, i) => {
      if (index === i) {
        setindexLoading(i)
      }
    })
    try {
      const response = await newFatch(`/api/editQuote?quoteId=${quote_id}`);
      const result = await response.json();
      newArray = result.data.map(({ product_name, price, quantity, variants }) => {
        let variantsData = Object.entries(JSON.parse(variants));
        let propertiesData = variantsData.map(([key, val]) => {
          return { "name": key, "value": val }
        })

        return {
          title: product_name,
          price: `${price}`,
          quantity: quantity,
          properties: propertiesData
        };
      });
    } catch (error) {
      console.error("Error:", error);
    }

    try {
      const response = await newFatch(`/api/quote_To_order?data=${JSON.stringify(newArray)}&&quoteId=${quote_id}`);
      const result = await response.json();
      if (result.msg === "success") {
        setSmallLoading(false)
        ShopApi.swtAlt(swtAltMsg);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleGo = (quote_order_id) => {
    window.top.location.replace(`https://admin.shopify.com/store/${shop.current.shopName}/orders/${quote_order_id}`)
  }

  const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(data);

  const rowMarkup = data.map(
    (
      {
        quote_id,
        total_order_amount,
        total_products,
        user_data,
        status,
        quote_update_time,
        quote_order_id
      },
      index,
    ) => {
      const originalTime = quote_update_time;
      const parsedTime = new Date(originalTime);
      const formattedTime = parsedTime.toLocaleString('en-US', { timeZone: 'UTC' });
      return (
        // id={product_id} key={product_id}
        <IndexTable.Row position={index} key={index}>
          <IndexTable.Cell>{map.get("a").val++}</IndexTable.Cell>
          <IndexTable.Cell>
            {JSON.parse(user_data).map((user) => {
              return (
                user.email
              )
            })}
          </IndexTable.Cell>
          <IndexTable.Cell>{total_products}</IndexTable.Cell>
          <IndexTable.Cell>{total_order_amount}</IndexTable.Cell>
          <IndexTable.Cell>{formattedTime}</IndexTable.Cell>
          <IndexTable.Cell>{status}</IndexTable.Cell>
          <IndexTable.Cell>
            {status === "Order Placed"
              ?
              <span className={`${planId === 1 && 'disabledButton'}`}>
                <Button onClick={() => handleGo(quote_order_id)} disabled={planId === 1 && true}>See Order Details</Button>
              </span>
              :
              <>
                <span style={{ marginRight: '10px' }}>
                  <Button onClick={() => editHandler(quote_id)}>
                    Edit Quote
                  </Button>
                </span>

                {smallLoading && indexLoading === index ? <span className={`${smallLoading && 'indexLoading'}`}><SmallSpinner /></span> :
                  <span className={`${planId === 1 && 'disabledButton'}`}>
                    <Button onClick={() => convertHandler(quote_id, index)} disabled={planId === 1 && true}>
                      Convert to Quote
                    </Button>

                  </span>
                }

              </>
            }
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  const searchHandle = async () => {
    try {
      const response = await newFatch(`/api/serachProducts?shop=${JSON.stringify(shop.current.shopName)}`);
      const result = await response.json();
      const searchedData = result.data;

      if (searchResults !== "") {
        const filteredArray = searchedData.filter((item) => {
          const userData = JSON.parse(item.user_data);
          return userData.some((data) => {
            if (data.email) {
              return data.email.includes(searchResults);
            }
          });
        });
        const slicedArray = filteredArray.slice(paginationFunc.firstPost, listingPerPage);
        setData(slicedArray)
      } else {
        listingDataApi(shop.current)
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true)
      await listingDataApi(shop.current);
      setLoading(false)
    } catch (err) {
      return err;
    }
  }

  const handleSelectChange = useCallback(
    async (value) => {
      setLoading(true)
      setListingPerPage(value);
      localStorage.setItem("listPerPage", value)
      setData([])
      await listingDataApi(shop.current);
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
          {pagination.loading ?
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
                    onChange={(e) => setSearchResults(e.target.value)}
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

              {planId === 1 &&
                <div className='note'>
                  Note:- You do not have subscribed any plan yet, please upgrade your plan, so that you can enjoy some more functions.
                </div>
              }


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
                      { title: 'Customer Email' },
                      { title: 'Total Products' },
                      { title: 'Total Order Amount' },
                      { title: 'Update Time' },
                      { title: 'Status' },
                      { title: 'Actions' },
                    ]}
                    selectable={false}
                    style={{ position: 'fixed' }}
                  >
                    {rowMarkup}

                  </IndexTable>
                </LegacyCard>
              </div>

              {totalRecord > listingPerPage &&
                <PaginationControl
                  page={parseInt(pagination.currentPage)}
                  total={totalRecord}
                  limit={JSON.parse(listingPerPage)}
                  changePage={(page) => {
                    pagination.pageChange(page)
                  }}
                />
              }
            </div>
          }
        </div>
      }
    </>
  )
}

export default QuoteList;