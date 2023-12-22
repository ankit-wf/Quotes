import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthenticatedFetch } from '../hooks';
import SmallSpinner from '../hooks/SmallSpinner';
import useApi from '../hooks/useApi';
import { isConfirmedFun } from '../utilsFunction/UtilsFunction';
import * as alertSwal from "../constant/alertSwal";
import {
    IndexTable,
    LegacyCard,
    Spinner,
    Button,
    Text,
    Icon,
    useIndexResourceState,
} from '@shopify/polaris';
import {
    DeleteMajor,
    MobileBackArrowMajor
} from '@shopify/polaris-icons';

const EditQuote = () => {
    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();
    const alertMsg = useApi();
    const { search } = useLocation()
    const searchParams = new URLSearchParams(search.trim());
    let quoteId = searchParams.get('id')
    const [quoteData, setQuotesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [priceData, setPriceData] = useState([{ quote_detail_id: "", price: null }]);
    const [quantityData, setQuantityData] = useState([{ quote_detail_id: "", quantity: null }]);
    const [remarksData, setReamrksData] = useState();
    const [deletedQuoteDetailIds, setDeletedQuoteDetailIds] = useState([]);
    const [userData, setUserData] = useState([]);
    const { selectedResources, allResourcesSelected, handleSelectionChange } = useIndexResourceState(quoteData);
    const [smallLoading, setSmallLoading] = useState(false);
    const swtAltMsg = { title: "Successfully Updated", text: "Quote has been updadted successfully", isSwtAlt: true, smallSpinner: setSmallLoading };
    const shop = useRef();

    useEffect(async() => {
        const shopApi = await alertMsg.shop();
        shop.current = shopApi;
        showQuoteList()
    }, [])


    const showQuoteList = async () => {
        try {
            const response = await fetch(`/api/editQuote?quoteId=${quoteId}`);
            const result = await response.json();
            setQuotesData(result.data)
            let resultData = result.data
            let remarksValue = result.remarksData
            console.log("kkkkkkkkkkkkkkkkk", resultData)
            const updatedPrice = resultData.map(item => ({ quote_detail_id: item.quote_detail_id, price: item.price }));
            setPriceData(updatedPrice);

            const updatedQuantity = resultData.map(item => ({ quote_detail_id: item.quote_detail_id, quantity: item.quantity }));
            setQuantityData(updatedQuantity);


            setReamrksData(remarksValue)

            const getUserData = resultData[0].user_data;
            const firstObjectData = JSON.parse(getUserData)
            const mergedObject = Object.assign({}, ...firstObjectData);
            const finalUserData = Object.entries(mergedObject)
            setUserData(finalUserData)
            setLoading(false)
        } catch (error) {
            console.error("Error:", error);
        }
    }

    useMemo(() => {
        quoteData.forEach((item) => {
            priceData.find((val) => {
                if (item.quote_detail_id === val.quote_detail_id) {
                    return item.price = val.price;
                }
            })
        })

        quoteData.forEach((item) => {
            quantityData.find((val) => {
                if (item.quote_detail_id === val.quote_detail_id) {
                    return item.quantity = val.quantity;
                }
            })
        })

        quoteData.forEach((item) => {
            return item.remarks = remarksData;
        })
    }, [priceData, quantityData, remarksData])

    const deleteQuoteHandler = (quoteDetailId) => {
        isConfirmedFun(alertSwal.AlertTitle,
            alertSwal.AlertTextForDelete,
            alertSwal.AlertIcon,
            alertSwal.AlertShowCancelButton,
            alertSwal.AlertConfirmButtonColor,
            alertSwal.AlertCancelButtonColor,
            alertSwal.AlertConfirmDeleteText,
            handleDelete, quoteDetailId);
    }


    // const handleDelete = (quoteDetailId) => {
    //     const updatedArray = quoteData.filter(item => item.quote_detail_id !== quoteDetailId);
    //     const updatedArray2 = priceData.filter(item => item.quote_detail_id !== quoteDetailId);
    //     const updatedArray3 = quantityData.filter(item => item.quote_detail_id !== quoteDetailId);

    //     setDeletedQuoteDetailIds(prevIds => [...prevIds, quoteDetailId]);
    //     setQuotesData(updatedArray);
    //     setPriceData(updatedArray2);
    //     setQuantityData(updatedArray3);
    // }

    const handleSaveQuote = async () => {
        setSmallLoading(true)
        try {
            const response = await fetch(`/api/saveQuote?deletedQuoteIds=${JSON.stringify(deletedQuoteDetailIds)}&&updatedData=${JSON.stringify(quoteData)}`);
            await response.json();
            setSmallLoading(false)
            alertMsg.swtAlt(swtAltMsg);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const handlePriceChange = (e, index, quote_detail_id) => {
        setPriceData(prevPrice => {
            const newPrice = [...prevPrice];
            newPrice[index] = { quote_detail_id: quote_detail_id, price: e.target.value };
            return newPrice;
        });
    }

    const handleQuantityChange = (e, index, quote_detail_id) => {
        setQuantityData(prevQuantity => {
            const newQuantity = [...prevQuantity];
            newQuantity[index] = { quote_detail_id: quote_detail_id, quantity: e.target.value };
            return newQuantity;
        });
    }

    const handleGoToProduct = (handle) => {
        const url = `https://${shop.current.domain}/products/${handle}`
        window.top.location.replace(url)
    }

    const rowMarkup = quoteData.map(
        (
            {
                // quote_id,
                product_name,
                product_image,
                quote_detail_id,
                price,
                quantity,
                product_handle
            },
            index,
        ) => {
            return (
                // id={product_id} key={product_id}
                <IndexTable.Row position={index}>
                    <IndexTable.Cell>
                        {index + 1}
                        {/* {map.get("a").val++} */}
                    </IndexTable.Cell>
                    <IndexTable.Cell><span className='productTitle' onClick={() => handleGoToProduct(product_handle)}>{product_name}</span></IndexTable.Cell>
                    <IndexTable.Cell>
                        <img src={product_image} className='imgcss' alt={product_name} />
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        <input
                            key={index}
                            placeholder='Price'
                            type="text"
                            value={price}
                            onChange={(e) => { handlePriceChange(e, index, quote_detail_id) }}
                            className='fieldInput'
                        />
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                        <input
                            key={index}
                            placeholder='Quantity'
                            type="text"
                            value={quantity}
                            onChange={(e) => { handleQuantityChange(e, index, quote_detail_id) }}
                            className='fieldInput'
                        />
                    </IndexTable.Cell>
                    {/* <IndexTable.Cell>
                        <Button onClick={() => deleteQuoteHandler(quote_detail_id)}>
                            <Icon
                                source={DeleteMajor}
                                tone="base"
                            />
                        </Button>
                    </IndexTable.Cell> */}
                </IndexTable.Row>
            );
        }
    );


    return (
        loading ?
            <div className='spinnerStyle'>
                <Spinner accessibilityLabel="Small spinner example" size="large" />
            </div>
            :
            <div className='editPage'>
                <div className='editHeader'>
                    <div className='editHeaderInnerDiv'>
                        <Button onClick={() => navigate(-1)}>
                            <Icon
                                source={MobileBackArrowMajor}
                                tone="base"
                            />
                        </Button>
                        <Text variant="heading2xl" as="h3" >
                            Edit Your Quote
                        </Text>
                    </div>

                    <div className={`${smallLoading && 'smallSpinOnSve'}`}>
                        {smallLoading ? <SmallSpinner /> :
                            <Button onClick={handleSaveQuote}>
                                Save Quote
                            </Button>
                        }
                    </div>
                </div>

                <div className='customerInfo'>
                    <span className="topHeading"><Text variant="headingMd" as="h1" >Customer Information</Text></span>
                    {userData.map(([key, value], index) => {
                        return (
                            <p key={index}><span>{key}:</span>{value}</p>
                        )
                    })}

                    <div className='textareaDiv'>
                        <label>Remarks:</label>
                        <textarea
                            placeholder='Remarks'
                            rows="2"
                            cols="20"
                            value={remarksData}
                            onChange={(e) => setReamrksData(e.target.value)}
                            className='remarksInput'
                        />
                    </div>
                </div>

                <div className='productInfo'>
                    <span className="topHeading"><Text variant="headingMd" as="h5" >Quote Information</Text></span>

                    <LegacyCard>
                        <IndexTable
                            itemCount={quoteData.length}
                            selectedItemsCount={
                                allResourcesSelected ? 'All' : selectedResources.length
                            }
                            onSelectionChange={handleSelectionChange}
                            headings={[
                                { title: 'Sr No.' },
                                { title: 'Product Name' },
                                { title: 'Product Image' },
                                { title: 'Price' },
                                { title: 'Quantity' },
                                // { title: 'Action' }
                            ]}
                            selectable={false}
                            style={{ position: 'fixed' }}
                        >
                            {rowMarkup}

                        </IndexTable>
                    </LegacyCard>
                </div>
            </div>



    )
}

export default EditQuote