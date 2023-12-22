import React, { useEffect, useState } from 'react'
import { Frame, HorizontalGrid, VerticalStack, AlphaCard, Page, Text } from '@shopify/polaris';
import { useForm } from "react-hook-form";
// import skeletonImage from '../assets/hero.png';
import CssFilterConverter from "css-filter-converter";
import Swal from "sweetalert2";
// import loaderGif from "./loaderGreen.gif"
// import SkeletonPage1 from './SkeletonPage1';
import CustomStyle from './CustomStyle';
import useApi from '../hooks/useApi';
import SaveBar from './SaveBar';
import './css/CustomStyle.css'

const ButtonSetting = () => {

    const appMetafield = useApi();
    const [saveBar, setSaveBar] = useState(false);
    const [isloading, setIsLoading] = useState(false);

    const [wishlistTextDirection, setWishlistTextDirection] = useState("");
    const [selectedButton, setSelectedButton] = useState("text-button");
    const [selectedIcon, setSelectedIcon] = useState("star");
    const [selectedAnimation, setSelectedAnimation] = useState("none");
    const [colorBG, setColorBG] = useState("");
    const [colorText, setColorText] = useState("");
    const [hoverBox, setHoverBox] = useState("");
    const [buttonBorderColor, setButtonBorderColor] = useState("");
    const [hoverBgColor, setHoverBgColor] = useState("");
    const [hoverTextColor, setHoverTextColor] = useState("");
    const [hoverBorderColor, setHoverBorderColor] = useState("");

    const [newObj, setNewObj] = useState({
        fontSize: "",
        fontFamily: "",
        borderRadiusTopLeft: "",
        borderRadiusTopRight: "",
        borderRadiusBottomRight: "",
        borderRadiusBottomLeft: "",
        borderRadiusUnit: "",
        paddingTop: "",
        paddingRight: "",
        paddingBottom: "",
        paddingLeft: "",
        paddingUnit: "",
        marginTop: "",
        marginRight: "",
        marginBottom: "",
        marginLeft: "",
        marginUnit: "",
        width: "",
        borderValue: "",
        borderUnit: "",
        borderType: "",
        textAlign: "",
        hoverBorderValue: "",
        hoverBorderUnit: "",
        hoverBorderType: ""
    });

    // ---------------for converting the color to the filter property---------------
    let iconColor = CssFilterConverter.rgbToFilter(colorText);
    let iconColorHover = CssFilterConverter.rgbToFilter(hoverTextColor);

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

    useEffect(async () => {
        // getAllAppDataMetafields();
    }, []);

    async function getAllAppDataMetafields() {
        const dataArray = await appMetafield.getAllAppMetafields();
        for (let i = 0; i < dataArray.length; i++) {

            if (dataArray[i].node.key === "general-setting") {
                let dData = JSON.parse(dataArray[i].node.value);
                setWishlistTextDirection(dData.wishlistTextDirection);
            };

            if (dataArray[i].node.key === "wishlist-button-setting") {
                setIsLoading(true);
                let dData = JSON.parse(dataArray[i].node.value);
                reset({
                    iconType: dData.iconType,
                    animationType: dData.animationType,
                    fontSize: dData.fontSize,
                    fontFamily: dData.fontFamily,

                    borderRadiusTopLeft: dData.borderRadius.topLeft,
                    borderRadiusTopRight: dData.borderRadius.topRight,
                    borderRadiusBottomRight: dData.borderRadius.bottomRight,
                    borderRadiusBottomLeft: dData.borderRadius.bottomLeft,
                    borderRadiusUnit: dData.borderRadius.unit,

                    paddingTop: dData.padding.top,
                    paddingRight: dData.padding.right,
                    paddingBottom: dData.padding.bottom,
                    paddingLeft: dData.padding.left,
                    paddingUnit: dData.padding.unit,

                    marginTop: dData.margin.top,
                    marginRight: dData.margin.right,
                    marginBottom: dData.margin.bottom,
                    marginLeft: dData.margin.left,
                    marginUnit: dData.margin.unit,

                    borderInput: dData.border.value,
                    borderInputUnit: dData.border.unit,
                    borderType: dData.border.type,

                    textAlign: dData.textAlign,
                    width: dData.width,

                    hover: dData.hover.hoverValue,
                    hoverBorderInput: dData.hover.border.value,
                    hoverBorderInputUnit: dData.hover.border.unit,
                    hoverBorderType: dData.hover.border.type,

                    // ----------------for the cart button style----------------
                    cartButtonfontSize: dData.cartButtonStyle.fontSize,
                    cartButtonfontFamily: dData.cartButtonStyle.fontFamily,

                    cartButtonborderRadiusTopLeft: dData.cartButtonStyle.borderRadius.topLeft,
                    cartButtonborderRadiusTopRight: dData.cartButtonStyle.borderRadius.topRight,
                    cartButtonborderRadiusBottomRight: dData.cartButtonStyle.borderRadius.bottomRight,
                    cartButtonborderRadiusBottomLeft: dData.cartButtonStyle.borderRadius.bottomLeft,
                    cartButtonborderRadiusUnit: dData.cartButtonStyle.borderRadius.unit,

                    cartButtonpaddingTop: dData.cartButtonStyle.padding.top,
                    cartButtonpaddingRight: dData.cartButtonStyle.padding.right,
                    cartButtonpaddingBottom: dData.cartButtonStyle.padding.bottom,
                    cartButtonpaddingLeft: dData.cartButtonStyle.padding.left,
                    cartButtonpaddingUnit: dData.cartButtonStyle.padding.unit,

                    cartButtonmarginTop: dData.cartButtonStyle.margin.top,
                    cartButtonmarginRight: dData.cartButtonStyle.margin.right,
                    cartButtonmarginBottom: dData.cartButtonStyle.margin.bottom,
                    cartButtonmarginLeft: dData.cartButtonStyle.margin.left,
                    cartButtonmarginUnit: dData.cartButtonStyle.margin.unit,

                    cartButtonborderInput: dData.cartButtonStyle.border.value,
                    cartButtonborderInputUnit: dData.cartButtonStyle.border.unit,
                    cartButtonborderType: dData.cartButtonStyle.border.type,

                    cartButtontextAlign: dData.cartButtonStyle.textAlign,
                    cartButtonwidth: dData.cartButtonStyle.width,

                    cartButtonhover: dData.cartButtonStyle.hover.hoverValue,
                    cartButtonhoverBorderInput: dData.cartButtonStyle.hover.border.value,
                    cartButtonhoverBorderInputUnit: dData.cartButtonStyle.hover.border.unit,
                    cartButtonhoverBorderType: dData.cartButtonStyle.hover.border.type,

                });
                setSelectedButton(dData.type);
                setColorBG(dData.bgColor);
                setColorText(dData.textColor);
                setSelectedIcon(dData.iconType);
                setSelectedAnimation(dData.animationType);
                setButtonBorderColor(dData.border.color);
                setHoverBox(dData.hover.hoverValue);
                setHoverBgColor(dData.hover.bgColor);
                setHoverTextColor(dData.hover.textColor);
                setHoverBorderColor(dData.hover.border.color);

                CBsetColorBG(dData.cartButtonStyle.bgColor);
                CBsetColorText(dData.cartButtonStyle.textColor);
                CBsetButtonBorderColor(dData.cartButtonStyle.border.color);
                CBsetHoverBox(dData.cartButtonStyle.hover.hoverValue);
                CBsetHoverBgColor(dData.cartButtonStyle.hover.bgColor);
                CBsetHoverTextColor(dData.cartButtonStyle.hover.textColor);
                CBsetHoverBorderColor(dData.cartButtonStyle.hover.border.color);

                setNewObj({
                    fontSize: dData.fontSize,
                    fontFamily: dData.fontFamily,
                    borderRadiusTopLeft: dData.borderRadius.topLeft,
                    borderRadiusTopRight: dData.borderRadius.topRight,
                    borderRadiusBottomRight: dData.borderRadius.bottomRight,
                    borderRadiusBottomLeft: dData.borderRadius.bottomLeft,
                    borderRadiusUnit: dData.borderRadius.unit,
                    paddingTop: dData.padding.top,
                    paddingRight: dData.padding.right,
                    paddingBottom: dData.padding.bottom,
                    paddingLeft: dData.padding.left,
                    paddingUnit: dData.padding.unit,
                    marginTop: dData.margin.top,
                    marginRight: dData.margin.right,
                    marginBottom: dData.margin.bottom,
                    marginLeft: dData.margin.left,
                    marginUnit: dData.margin.unit,
                    width: dData.width,
                    borderValue: dData.border.value,
                    borderUnit: dData.border.unit,
                    borderType: dData.border.type,
                    textAlign: dData.textAlign,
                    hoverBorderValue: dData.hover.border.value,
                    hoverBorderUnit: dData.hover.border.unit,
                    hoverBorderType: dData.hover.border.type
                })
            }
        }
    };

    (function styleFxn() {
        let styleTag = document.createElement("style");
        styleTag.innerHTML = `
    .skeleton-div .btn1 {
        background-color: ${colorBG};
        color: ${colorText};
        border: ${newObj.borderValue}${newObj.borderUnit} ${newObj.borderType} ${buttonBorderColor};
        border-radius: ${newObj.borderRadiusTopLeft}${newObj.borderRadiusUnit} ${newObj.borderRadiusTopRight}${newObj.borderRadiusUnit} ${newObj.borderRadiusBottomRight}${newObj.borderRadiusUnit} ${newObj.borderRadiusBottomLeft}${newObj.borderRadiusUnit};
        font-size: ${newObj.fontSize};
        font-family: ${newObj.fontFamily};
        margin: ${newObj.marginTop}${newObj.marginUnit} ${newObj.marginRight}${newObj.marginUnit} ${newObj.marginBottom}${newObj.marginUnit} ${newObj.marginLeft}${newObj.marginUnit};
        padding: ${newObj.paddingTop}${newObj.paddingUnit} ${newObj.paddingRight}${newObj.paddingUnit} ${newObj.paddingBottom}${newObj.paddingUnit} ${newObj.paddingLeft}${newObj.paddingUnit};
        width: ${newObj.width};
        text-align: ${newObj.textAlign};    
    }
    .skeleton-div .btn3:hover {
        background-color: ${hoverBgColor}  !important;
        color: ${hoverTextColor}  !important;
        border: ${newObj.hoverBorderValue}${newObj.hoverBorderUnit} ${newObj.hoverBorderType} ${hoverBorderColor}  !important;
    }
    .skeleton-div .btn3:hover .btnIcon {
        filter: ${iconColorHover.color} !important;
    }
    .btnIconAlone:hover {
        filter: ${iconColorHover.color} !important;
    }
    }`;
        document.getElementsByTagName("head")[0].appendChild(styleTag);
    })();

    const saveToMetafield = async (data) => {
        console.log("data", data)
        Swal.fire({
            text: "Please wait for a while...",
            imageUrl: "loaderGif",
            showConfirmButton: false,
        });
        let dataSubmit = {
            type: selectedButton,
            iconColor: iconColor.color,
            iconType: selectedIcon,
            animationType: data.animationType,
            bgColor: colorBG,
            textColor: colorText,
            fontSize: data.fontSize,
            fontFamily: data.fontFamily,
            borderRadius: {
                topLeft: data.borderRadiusTopLeft,
                topRight: data.borderRadiusTopRight,
                bottomRight: data.borderRadiusBottomRight,
                bottomLeft: data.borderRadiusBottomLeft,
                unit: data.borderRadiusUnit
            },
            padding: {
                top: data.paddingTop,
                right: data.paddingRight,
                bottom: data.paddingBottom,
                left: data.paddingLeft,
                unit: data.paddingUnit
            },
            margin: {
                top: data.marginTop,
                right: data.marginRight,
                bottom: data.marginBottom,
                left: data.marginLeft,
                unit: data.marginUnit
            },
            width: data.width,
            border: {
                value: data.borderInput,
                unit: data.borderInputUnit,
                type: data.borderType,
                color: buttonBorderColor
            },
            textAlign: data.textAlign,
            hover: {
                hoverValue: data.hover,
                bgColor: hoverBgColor,
                textColor: hoverTextColor,
                iconColor: iconColorHover.color,
                border: {
                    value: data.hoverBorderInput,
                    unit: data.hoverBorderInputUnit,
                    type: data.hoverBorderType,
                    color: hoverBorderColor
                }
            },
            cartButtonStyle: {
                bgColor: CBcolorBG,
                textColor: CBcolorText,
                fontSize: data.cartButtonfontSize,
                fontFamily: data.cartButtonfontFamily,
                borderRadius: {
                    topLeft: data.cartButtonborderRadiusTopLeft,
                    topRight: data.cartButtonborderRadiusTopRight,
                    bottomRight: data.cartButtonborderRadiusBottomRight,
                    bottomLeft: data.cartButtonborderRadiusBottomLeft,
                    unit: data.cartButtonborderRadiusUnit
                },
                padding: {
                    top: data.cartButtonpaddingTop,
                    right: data.cartButtonpaddingRight,
                    bottom: data.cartButtonpaddingBottom,
                    left: data.cartButtonpaddingLeft,
                    unit: data.cartButtonpaddingUnit
                },
                margin: {
                    top: data.cartButtonmarginTop,
                    right: data.cartButtonmarginRight,
                    bottom: data.cartButtonmarginBottom,
                    left: data.cartButtonmarginLeft,
                    unit: data.cartButtonmarginUnit
                },
                width: data.cartButtonwidth,
                border: {
                    value: data.cartButtonborderInput,
                    unit: data.cartButtonborderInputUnit,
                    type: data.cartButtonborderType,
                    color: CBbuttonBorderColor
                },
                textAlign: data.cartButtontextAlign,
                hover: {
                    hoverValue: data.cartButtonhover,
                    bgColor: CBhoverBgColor,
                    textColor: CBhoverTextColor,
                    iconColor: iconColorHover.color,
                    border: {
                        value: data.cartButtonhoverBorderInput,
                        unit: data.cartButtonhoverBorderInputUnit,
                        type: data.cartButtonhoverBorderType,
                        color: CBhoverBorderColor
                    }
                }
            }
        };
        console.log("LLLL ", dataSubmit)
        const getAppMetafieldId = await appMetafield.metafield();
        const appMetadata = {
            key: "quick-quote-button-setting",
            namespace: "quotes-app",
            ownerId: getAppMetafieldId,
            type: "single_line_text_field",
            value: JSON.stringify(dataSubmit)
        };
        await appMetafield.createAppMetafield(appMetadata);
        setSaveBar(false);
    };

    // function textButtonFxn() {
    //     return <div style={{ backgroundColor: colorBG, color: colorText }} className={` btn1 ${hoverBox === "yes" && "btn3"} ${selectedAnimation === "none" && `animation-none`} ${selectedAnimation === "shake-side" && `animation-shake-side`} ${selectedAnimation === "shake-up" && `animation-shake-up`} ${selectedAnimation === "rotate" && `animation-rotate`} ${selectedAnimation === "fade-in" && `animation-fade_in `} ${selectedAnimation === "fade-out" && `animation-fade_out`}`}><b>ADD TO WISHLIST</b></div>
    // };

    // function iconTextButtonFxn() {
    //     return <div style={{ paddingLeft: "15px", backgroundColor: colorBG, color: colorText }} className={`btn1 ${hoverBox === "yes" && "btn3"} ${selectedAnimation === "none" && `animation-none`} ${selectedAnimation === "shake-side" && `animation-shake-side`} ${selectedAnimation === "shake-up" && `animation-shake-up`} ${selectedAnimation === "rotate" && `animation-rotate`} ${selectedAnimation === "fade-in" && `animation-fade_in `} ${selectedAnimation === "fade-out" && `animation-fade_out`}    `}  > <div style={{ filter: iconColor.color }} className={`chooseicon ${hoverBox === "yes" && "btnIcon"} ${selectedIcon === "heart" && `heartICON`}  ${selectedIcon === "star" && `starICON`} ${selectedIcon === "save" && `saveICON`} `}></div><b>ADD TO WISHLIST</b></div>
    // };

    // function textFxn() {
    //     return <div style={{ backgroundColor: "transparent", color: colorText }} className={`btn1 ${hoverBox === "yes" && "btn3"} ${selectedAnimation === "none" && `animation-none`} ${selectedAnimation === "shake-side" && `text-button-main`} ${selectedAnimation === "shake-up" && `text-button-main-up`} ${selectedAnimation === "rotate" && `text-button-main-ripple`} ${selectedAnimation === "fade-in" && `text-button-main-fade_in`} ${selectedAnimation === "fade-out" && `text-button-main-fade_out`}`}><b>ADD TO WISHLIST</b></div>
    // };

    // function iconTextFxn() {
    //     return <div style={{ paddingLeft: "10px", backgroundColor: "transparent", color: colorText }} className={`btn1 ${hoverBox === "yes" && "btn3"} ${selectedAnimation === "none" && `animation-none`} ${selectedAnimation === "shake-side" && `text-button-main`} ${selectedAnimation === "shake-up" && `text-button-main-up`} ${selectedAnimation === "rotate" && `text-button-main-ripple`} ${selectedAnimation === "fade-in" && `text-button-main-fade_in`} ${selectedAnimation === "fade-out" && `text-button-main-fade_out`}`}> <div style={{ filter: iconColor.color }} className={`chooseicon ${hoverBox === "yes" && "btnIcon"} ${selectedIcon === "heart" && `heartICON`}  ${selectedIcon === "star" && `starICON`} ${selectedIcon === "save" && `saveICON`} `}></div><b>ADD TO WISHLIST</b></div>
    // };

    // function iconFxn() {
    //     return <div className='icon-main'><div style={{ filter: iconColor.color }} className={`chooseicon ${hoverBox === "yes" && "btnIconAlone"} ${selectedIcon === "heart" && `heartICON`}  ${selectedIcon === "star" && `starICON`} ${selectedIcon === "save" && `saveICON`} ${selectedAnimation === "none" && `animation-none`} ${selectedAnimation === "shake-side" && `icon-shake-side`} ${selectedAnimation === "shake-up" && `icon-shake-up`} ${selectedAnimation === "rotate" && `icon-rotate`} ${selectedAnimation === "fade-in" && `icon-fade_in`} ${selectedAnimation === "fade-out" && `icon-fade_out`}`} ></div></div>
    // };

    const passValueToCustomStyle = {
        register: register,
        setSaveBar: setSaveBar,
        bgColor: colorBG,
        setBgColor: setColorBG,
        textColor: colorText,
        setTextColor: setColorText,
        borderColor: buttonBorderColor,
        setBorderColor: setButtonBorderColor,
        hoverBgColor: hoverBgColor,
        setHoverBgColor: setHoverBgColor,
        hoverTextColor: hoverTextColor,
        setHoverTextColor: setHoverTextColor,
        hoverBorderColor: hoverBorderColor,
        setHoverBorderColor: setHoverBorderColor,
        hoverBox: hoverBox,
        setHoverBox: setHoverBox,
        oldObj: newObj,
        setOldObj: setNewObj
    };

    const [CBcolorBG, CBsetColorBG] = useState("");
    const [CBcolorText, CBsetColorText] = useState("");
    const [CBhoverBox, CBsetHoverBox] = useState("");
    const [CBbuttonBorderColor, CBsetButtonBorderColor] = useState("");
    const [CBhoverBgColor, CBsetHoverBgColor] = useState("");
    const [CBhoverTextColor, CBsetHoverTextColor] = useState("");
    const [CBhoverBorderColor, CBsetHoverBorderColor] = useState("");

    const passValueToCustomStyleForCartButton = {
        register: register,
        setSaveBar: setSaveBar,
        bgColor: CBcolorBG,
        setBgColor: CBsetColorBG,
        textColor: CBcolorText,
        setTextColor: CBsetColorText,
        borderColor: CBbuttonBorderColor,
        setBorderColor: CBsetButtonBorderColor,
        hoverBgColor: CBhoverBgColor,
        setHoverBgColor: CBsetHoverBgColor,
        hoverTextColor: CBhoverTextColor,
        setHoverTextColor: CBsetHoverTextColor,
        hoverBorderColor: CBhoverBorderColor,
        setHoverBorderColor: CBsetHoverBorderColor,
        hoverBox: CBhoverBox,
        setHoverBox: CBsetHoverBox,
    };

    return (
        <div dir={wishlistTextDirection}>
            {/* {!isloading ? <SkeletonPage1 /> : */}
                <Frame>
                    <form onSubmit={handleSubmit(saveToMetafield)}>
                        {(saveBar) ? <SaveBar /> : ""}
                        <Page title="Wishlist button setting" subtitle='Here you can customise the Wishlist button of your site' >

                            <AlphaCard>
                                <Text variant="headingXl" as="h4">Add to Wishlist Button</Text>
                                {/* <Text variant="headingXs" as="h6">Customise your add to wishlist button</Text> */}

                                <div >
                                    <HorizontalGrid columns={{ xs: 1, md: "2fr 1fr", lg: 2, xl: 2 }} gap="4">

                                        <VerticalStack gap="4">
                                            <AlphaCard roundedAbove="sm">
                                                <VerticalStack gap="2">
                                                    <Text variant="headingLg" as="h5">Button appearance</Text>
                                                    <Text variant="headingXs" as="h6">Choose wishlist button type</Text>
                                                    {/* <div className='optionBox'>
                                                        <div><label htmlFor="text-button">
                                                            <input {...register("buttonTypeRadio")} type="radio" value="text-button" id="text-button" checked={selectedButton === "text-button" ? true : false} onChange={(e) => { setSelectedButton(e.target.value), setSaveBar(true) }} />
                                                            {textButtonFxn()}
                                                        </label></div>

                                                        <div><label htmlFor="icon-text-button">
                                                            <input {...register("buttonTypeRadio")} type="radio" value="icon-text-button" id="icon-text-button" checked={selectedButton === "icon-text-button" ? true : false} onChange={(e) => { setSelectedButton(e.target.value), setSaveBar(true) }} />
                                                            {iconTextButtonFxn()}
                                                        </label></div>

                                                        <div><label htmlFor="text">
                                                            <input {...register("buttonTypeRadio")} type="radio" value="text" id="text" checked={selectedButton === "text" ? true : false} onChange={(e) => { setSelectedButton(e.target.value), setSaveBar(true) }} />
                                                            {textFxn()}

                                                        </label></div>

                                                        <div><label htmlFor="icon-text">
                                                            <input {...register("buttonTypeRadio")} type="radio" value="icon-text" id="icon-text" checked={selectedButton === "icon-text" ? true : false} onChange={(e) => { setSelectedButton(e.target.value), setSaveBar(true) }} />
                                                            {iconTextFxn()}
                                                        </label></div>
                                                    </div> */}

                                                    {/* <div><label htmlFor="icon">
                                                        <input {...register("buttonTypeRadio")} type="radio" value="icon" id="icon" checked={selectedButton === "icon" ? true : false} onChange={(e) => { setSelectedButton(e.target.value), setSaveBar(true) }} />
                                                        {iconFxn()}
                                                    </label></div> */}

                                                    <div className='optionBox'>

                                                    </div>

                                                    <Text variant="headingXs" as="h4"> Pick a wishlist icon for your site</Text>
                                                    <div className='choose-icon-div'>
                                                        <div>
                                                            <input {...register("iconType")} type="radio" value="heart" id="heart" onChange={(e) => { setSelectedIcon(e.target.value), setSaveBar(true) }} /> <label htmlFor='heart'> <div className='chooseicon heartICON'></div></label>
                                                        </div>
                                                        <div>
                                                            <input {...register("iconType")} type="radio" value="star" id="star" onChange={(e) => { setSelectedIcon(e.target.value), setSaveBar(true) }} /> <label htmlFor='star'> <div className='chooseicon starICON'></div></label>
                                                        </div>
                                                        <div>
                                                            <input {...register("iconType")} type="radio" value="save" id="save" onChange={(e) => { setSelectedIcon(e.target.value), setSaveBar(true) }} /> <label htmlFor='save'> <div className='chooseicon saveICON'></div></label>
                                                        </div>
                                                    </div>

                                                    <Text variant="headingXs" as="h4"  > Pick animation for your button</Text>
                                                    <select {...register("animationType")} onChange={(e) => { setSelectedAnimation(e.target.value), setSaveBar(true) }} >
                                                        <option value="none">None</option>
                                                        <option value="shake-side">Shake Horizontal</option>
                                                        <option value="shake-up">Shake Vertical</option>
                                                        <option value="rotate">Spin</option>
                                                        <option value="fade-in">Fade In</option>
                                                        <option value="fade-out">Fade Out</option>
                                                    </select>
                                                </VerticalStack>
                                            </AlphaCard>
                                        </VerticalStack>

                                        <VerticalStack gap={{ xs: "4", md: "2" }}>
                                            <AlphaCard style={{ position: "relative" }} roundedAbove="sm">
                                                {/* <img src={skeletonImage} width='100%' /> */}
                                                <div className='skeleton-div'>
                                                    {/* {selectedButton === "text-button" ? textButtonFxn() : ""}
                                                    {selectedButton === "icon-text-button" ? iconTextButtonFxn() : ""}
                                                    {selectedButton === "text" ? textFxn() : ""}
                                                    {selectedButton === "icon-text" ? iconTextFxn() : ""}
                                                    {selectedButton === "icon" ? iconFxn() : ""} */}
                                                    BUTTON
                                                </div>
                                            </AlphaCard>
                                        </VerticalStack>

                                    </HorizontalGrid>
                                    <br />

                                    <AlphaCard>
                                        <Text variant="headingLg" as="h5"> Style-Box for the add to wishlist button </Text>
                                        <CustomStyle value={passValueToCustomStyle} hoverOption={true} formName="" />
                                    </AlphaCard>
                                </div>
                            </AlphaCard>

                            <br />

                            <AlphaCard>
                                <Text variant="headingXl" as="h4">Add to Cart Button</Text>
                                {/* <Text variant="headingXs" as="h6">Customise your add to cart button</Text> */}

                                <AlphaCard>
                                    <Text variant="headingLg" as="h5"> Style-Box for the add to cart button </Text>
                                    <CustomStyle value={passValueToCustomStyleForCartButton} hoverOption={true} formName="cartButton" />
                                </AlphaCard>
                            </AlphaCard>
                            <br />
                        </Page>
                    </form>
                </Frame>
            {/* } */}
        </div>
    )
}

export default ButtonSetting;