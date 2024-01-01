import {
  Page, Grid, LegacyCard, Select, ButtonGroup, Button, IndexTable, useIndexResourceState, Text,
  SkeletonBodyText,
  TextContainer,
  Spinner,
  ProgressBar,
  LegacyStack,
  Tooltip as Tool
} from '@shopify/polaris';
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, } from "recharts";
import { useAuthenticatedFetch } from '../hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { PaginationControl } from 'react-bootstrap-pagination-control';
import usePagination from '../hooks/usePagination';
import ProSubscription from './ProSubscription';
import "./css/myStyle.css";
import useApi from '../hooks/useApi';

export default function HomePage() {
  const { search } = useLocation();
  const ShopApi = useApi();
  const metafieldHook = useApi();
  const [shop, setShop] = useState({});
  const searchParams = new URLSearchParams(search.trim());
  const Navigate = useNavigate();
  let navigate = "/";
  const [status, setStatus] = useState("");
  let currentPage = searchParams.get('pagenumber');
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(true);
  const pagination = usePagination(currentPage, navigate);
  let listingPerPage = 5;
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalRecord1, setTotalRecord1] = useState(0);
  const [emailQuota, setEmailQuota] = useState("");
  const [data, setData] = useState([]);
  const [remainData, setRemainData] = useState([]);
  const paginationFunc = pagination.pagination(totalRecord, listingPerPage);
  let firstPost = paginationFunc.firstPost;
  const [selected, setSelected] = useState('today');
  const [totalChart, setTotalChart] = useState("today");
  const [chartOne, setChartOne] = useState([]);
  const [isFirstButtonActive, setIsFirstButtonActive] = useState(true);
  const options = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: 'lastWeek' },
    { label: 'Month', value: 'month' },
  ];
  const EmpArr = [];
  const fetch = useAuthenticatedFetch();
  let newPlan = 1;
  let toolData = emailQuota - remainData;
  const [planStatus, setPlanstatus] = useState("");
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;


  useEffect(async () => {
    console.log("i am here")
    const shopApi = await ShopApi.shop();
    const planId = await metafieldHook.getCurrentPlan();
    setPlanstatus(planId.currentPlan);
    setStatus(planId.planId);
    setShop(shopApi);

    try {
      const response = await fetch(`/api/folderSize`);
      const result = await response.json();
    } catch (error) {
      console.error("Error:", error);
    }

    if (planId.planId === 1) {
      listingPerPage = 3
      firstPost = 0
    }

    try {
      const response = await fetch(`/api/product/getproductstats?shopName=${shopApi.shopName}`);
      const result = await response.json();
      setTotalRecord(result.data[0].count)
    } catch (error) {
      console.error("Error:", error);
    }

    try {
      const response = await fetch(`/api/product/productList?shopName=${JSON.stringify(shopApi.shopName)}&&listingPerPage=${JSON.stringify(listingPerPage)}&&firstPost=${JSON.stringify(firstPost)}`);
      const result = await response.json();
      setData(result.data)
    } catch (error) {
      console.error("Error:", error);
    }

    Navigate({
      pathname: "/",
      search: `?pagenumber=${planId === 1 ? newPlan : pagination.currentPage}`
      // search: `?pagenumber=${ pagination.currentPage}`
    })

    try {
      const response = await fetch(`/api/countFilter?shopName=${JSON.stringify(shopApi.shopName)}&&value=${JSON.stringify(selected)}`);
      const result = await response.json();
      setTotalRecord1(result.data[0].count)
    } catch (error) {
      console.error("Error:", error);
    }

    try {
      const response = await fetch(`/api/chartFilter?shopName=${JSON.stringify(shopApi.shopName)}&&value=${JSON.stringify(totalChart)}`);
      const result = await response.json();
      setChartOne(result.data)

    } catch (error) {
      console.error("Error:", error);
    }

    try {
      const response = await fetch(`/api/plan/emailQuota?planName=${JSON.stringify(planId.currentPlan)}`);
      const result = await response.json();
      setEmailQuota(result.result[0].email_quota)
    } catch (error) {
      console.error("Error:", error);
    }

    try {
      const response = await fetch(`/api/remainingQuote?shop=${JSON.stringify(shopApi.shopName)}&&startDate=${planId.createDate}&&lastDate=${formattedDate}`);
      const result = await response.json();
      setRemainData(result.result)
    } catch (error) {
      console.error("Error:", error);
    }
    setLoader(false)
  }, [totalChart, currentPage, newPlan])



  let newData = [];
  let testArr = [];
  let newDataArr = [];
  for (let i = 0; i <= 30; i++) {
    const date = new Date();
    const start = date.setDate(date.getDate() - 30);
    let ddd = new Date(start)
    let ss = new Date(ddd.getFullYear(), ddd.getMonth(), ddd.getDate() + i)
    EmpArr.push({ date: ss, count: 0 });
  }

  EmpArr.map((d, i) => {
    const date = new Date(d.date);
    const newmonthWithDay = date.toLocaleString('default', { month: 'short', day: 'numeric' });
    testArr.push({ index: i + 1, date: newmonthWithDay, count: d.count })

  })

  chartOne.map((d, i) => {
    const date = new Date(d.create_date);
    const monthWithDay = date.toLocaleString('default', { month: 'short', day: 'numeric' });
    if (totalChart === "today") {
      newDataArr.push({ index: i + 1, date: monthWithDay, count: d.count })
    }
  })

  var monthName = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
  var months = [];
  let newArr = [];
  let OneArr = [];
  let monthDateArr = [];

  var dateVar = new Date();
  dateVar.setDate(1);
  for (let i = 0; i <= 11; i++) {
    months.push(monthName[dateVar.getMonth()]);
    dateVar.setMonth(dateVar.getMonth() - 1);
  }

  for (let i = 0; i < months.length; i++) {
    const element = months[i];
    newArr.push({ date: element, count: 0 })
  }

  chartOne.map((d, i) => {
    const date = new Date(d.create_date);
    const month = date.toLocaleString('en-US', { month: 'short' })
    const monthWithDay = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    newDataArr.push({ index: i + 1, date: monthWithDay, count: d.count })
    newData.push({ index: i + 1, date: month, count: d.count })
  })

  newArr.reverse();

  function reverseArr(input) {
    var ret = new Array;
    for (var i = input.length - 1; i >= 0; i--) {
      ret.push(input[i]);
    }
    return ret;
  }

  let newReverseArr = reverseArr(newArr);

  OneArr.push(newReverseArr.reverse())

  OneArr[0].map((e, i) => {
    monthDateArr.push({ index: i + 1, date: e.date, count: e.count })
  })
  monthDateArr.map((e) => {
    newData.map((g) => {
      if (e.date === g.date) {
        e.count = g.count;
      }
    })
  })

  testArr.map((val, ii) => {
    newDataArr.map((b, i) => {
      if (val.date === b.date) {
        val.count = b.count
      }
    })
  })

  let map = new Map();
  map.set("a", { val: status === 1 ? firstPost = 0 : firstPost })
  map.get("a").val++
  const handleSelectChange = async (value) => {
    setSelected(value)
    let newDate = new Date();
    let MyDateString;

    newDate.setDate(newDate.getDate());
    MyDateString = ('0' + newDate.getDate()).slice(-2) + '/' + ('0' + (newDate.getMonth() + 1)).slice(-2) + '/' + newDate.getFullYear();
    const response = await fetch(`/api/countFilter?shopName=${JSON.stringify(shop.shopName)}&&value=${JSON.stringify(value)}`);
    const result = await response.json();
    setTotalRecord1(result.data[0].count)
  }

  const handleFirstButtonClick = async (value) => {
    if (isFirstButtonActive) return;
    setIsFirstButtonActive(true);
    setTotalChart("today")
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 7000);
  };

  const handleSecondButtonClick = async (value) => {
    if (!isFirstButtonActive) return;
    setIsFirstButtonActive(false);
    setTotalChart("month")
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 7000);
  };


  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(data);
  let entries
  const all = (data) => {
    const db = JSON.parse(data)
    entries = Object.entries(db)
  }

  const rowMarkup = data.map(
    (
      { product_stats_id, product_name, views, clicks, conversions }
    ) => (

      <IndexTable.Row
        id={product_stats_id}
        key={product_stats_id}
        position={product_stats_id}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {map.get("a").val++}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{product_name}</IndexTable.Cell>
        <IndexTable.Cell>{views}</IndexTable.Cell>
        <IndexTable.Cell>{clicks}</IndexTable.Cell>
        <IndexTable.Cell>{conversions}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );


  return (
    <>
      {loader ?
        <div className='spinnerStyle'>
          <Spinner accessibilityLabel="Small spinner example" size="large" />
        </div>
        :
        <Page fullWidth>
          <span className="topHeading"><Text variant="heading2xl" as="h3" >Quotes</Text></span>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <LegacyCard sectioned >
                <div style={{ height: '150px' }}>
                  <div className="quotes_heading">
                    <div className='left_side_quotes'>
                      <p className='qoutes_text'>Account Information</p>
                    </div>
                  </div>

                  <div className='leftCardInfo'>
                    <span>Plan:</span>
                    <span>{planStatus}</span>
                  </div>
                  <div className='leftCardInfo'>
                    <span>Total Email Quota:-</span>
                    <span>{emailQuota}</span>
                  </div>

                  <div className='leftCardInfo'>
                    <span>Total Remaining Quota:-</span>
                    <div style={{ width: '400px', padding: '15px 100px', marginTop: '-32px', marginLeft: '60px' }}>
                      {emailQuota === "Unlimited" ? <p>Unlimited</p> :
                        <Tool active content={toolData} preferredPosition='mostSpace' activatorWrapper='span'>
                          <ProgressBar progress={toolData} />
                        </Tool>
                      }
                    </div>
                  </div>
                </div>
              </LegacyCard>
            </Grid.Cell>

            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
              <LegacyCard sectioned>
                <div style={{ height: '150px' }}>
                  <div className="quotes_heading">
                    <div className='left_side_quotes'>
                      <p className='qoutes_text'>Total Quotes</p>
                    </div>
                    <Select
                      options={options}
                      onChange={handleSelectChange}
                      value={selected}
                      className='right_side_div'
                    />

                  </div>
                  <p className="qoutes_counts">{totalRecord1}</p>
                </div>
              </LegacyCard>
            </Grid.Cell>

            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 12, xl: 12 }}>
              <LegacyCard title="" sectioned >
                <div style={{ height: '100%', }}>
                  <div style={{ display: 'flex', justifyContent: 'left' }}>
                    <LegacyStack vertical>
                      <Text variant="heading2xl" as="h3">
                        Quotes Report Charts
                      </Text>
                    </LegacyStack>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <ButtonGroup segmented>
                      <Button pressed={isFirstButtonActive} onClick={handleFirstButtonClick}>
                        DAY
                      </Button>
                      <Button pressed={!isFirstButtonActive} onClick={handleSecondButtonClick}>
                        MONTH
                      </Button>
                    </ButtonGroup>
                  </div>
                  <div style={{ height: '100%', width: '100%', marginTop: '20px' }}>
                    {loading ?
                      <div style={{ display: 'flex', height: '300px', justifyContent: 'center', alignItems: 'center' }}>
                        <Spinner accessibilityLabel="Small spinner example" size="large" />
                      </div>
                      : <LineChart width={990} height={300} data={totalChart === "today" ? testArr : monthDateArr} margin={{
                        top: 5,
                        right: 30,
                        left: 0,
                        bottom: 12,
                      }}>
                        <XAxis dataKey="index" angle={0} dx={0} dy={10} minTickGap={-200} />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="date"
                          stroke="#8884d8"
                          activeDot={{ r: 5 }}
                          strokeWidth={2}
                        />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" />
                      </LineChart>
                    }
                  </div>
                </div>
              </LegacyCard>
            </Grid.Cell>

            <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 12, xl: 12 }}>
              <LegacyCard sectioned>
                <div style={{ height: '400px' }}>
                  <div style={{ height: '70px' }}>
                    <LegacyStack vertical>
                      <Text variant="heading2xl" as="h3">
                        Product Conversions Data
                      </Text>
                    </LegacyStack>
                  </div>

                  {pagination.loading ? (
                    <div style={{ display: 'flex', height: '350px', justifyContent: 'center', alignItems: 'center' }}>
                      <Spinner accessibilityLabel="Small spinner example" size="large" />
                    </div>
                  ) : (
                    <div>
                      <LegacyCard>
                        <IndexTable
                          itemCount={data.length}
                          selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                          onSelectionChange={handleSelectionChange}
                          headings={[
                            { title: 'Sr.no' },
                            { title: 'Product Name' },
                            { title: 'Views' },
                            { title: 'Clicks' },
                            { title: 'Conversions' },
                          ]}
                          selectable={false}
                        >
                          {rowMarkup}
                        </IndexTable>
                      </LegacyCard>

                      {status === 1 && (
                        <>
                          {totalRecord - rowMarkup.length > 0 &&
                            <div className='freeSkeltonDiv'>
                              <LegacyCard sectioned>
                                <TextContainer>
                                  <SkeletonBodyText />
                                </TextContainer>
                              </LegacyCard>
                              <LegacyCard sectioned>
                                <TextContainer>
                                  <SkeletonBodyText />
                                </TextContainer>
                              </LegacyCard>

                              <div className='freeSeeMore'>
                                <p>To See All Remaining Records</p>
                                <ProSubscription />
                              </div>
                            </div>
                          }
                        </>
                      )}

                      {status === 2 &&
                        <>
                          {totalRecord < 100
                            ?
                            <PaginationControl
                              page={parseInt(pagination.currentPage)}
                              total={totalRecord}
                              limit={listingPerPage}
                              changePage={(page) => {
                                pagination.pageChange(page);
                              }}
                            />
                            :
                            <div className='freeSkeltonDiv'>
                              <LegacyCard sectioned>
                                <TextContainer>
                                  <SkeletonBodyText />
                                </TextContainer>
                              </LegacyCard>
                              <LegacyCard sectioned>
                                <TextContainer>
                                  <SkeletonBodyText />
                                </TextContainer>
                              </LegacyCard>
                              <div className='freeSeeMore'>
                                <p>Please Upgrade to Premium plan to see more records</p>
                                <ProSubscription />
                              </div>
                            </div>
                          }
                        </>
                      }


                      {status === 3 && (
                        <>
                          <PaginationControl
                            page={parseInt(pagination.currentPage)}
                            total={totalRecord}
                            limit={listingPerPage}
                            changePage={(page) => {
                              pagination.pageChange(page);
                            }}
                          />
                        </>
                      )}
                    </div>
                  )}

                </div>
              </LegacyCard>
            </Grid.Cell>
          </Grid>
        </Page >
      }
    </>
  );
} 