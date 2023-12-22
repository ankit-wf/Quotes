import React, { memo, useState } from 'react';
import { Text } from '@shopify/polaris';
import CustomColourPicker from './CustomColourPicker';
import CustomPadding from './CustomPadding';
import CustomBorderRadius from './CustomBorderRadius';
import CustomMargin from './CustomMargin';
import CustomHoverSetting from './CustomHoverSetting';

const CustomStyle = ({ value, hoverOption, formName }) => {

    // console.log("JJJJ ", hoverOption)

    const register = value.register;
    const setSaveBar = value.setSaveBar;
    const bgColor = value.bgColor;
    const setBgColor = value.setBgColor;
    const textColor = value.textColor;
    const setTextColor = value.setTextColor;
    const borderColor = value.borderColor;
    const setBorderColor = value.setBorderColor;
    const oldObj = value.oldObj;
    const setOldObj = value.setOldObj;

    const passValue = {
        register: value.register,
        setSaveBar: value.setSaveBar,
        oldOldObj: value.oldObj,
        setOldOldObj: value.setOldObj
    };

    const passHoverValue = {
        register: value.register,
        setSaveBar: value.setSaveBar,
        hoverBgColor: value.hoverBgColor,
        setHoverBgColor: value.setHoverBgColor,
        hoverTextColor: value.hoverTextColor,
        setHoverTextColor: value.setHoverTextColor,
        hoverBorderColor: value.hoverBorderColor,
        setHoverBorderColor: value.setHoverBorderColor,
        hoverBox: value.hoverBox,
        setHoverBox: value.setHoverBox,
        oldOldObj: value.oldObj,
        setOldOldObj: value.setOldObj
    };

    return (
        <>
            <div className='custom-style-main-div'>
                <div>
                    <label htmlFor="bgColor"><Text variant="headingXs" as="h4" > Pick a color for the Background </Text></label>
                    <div className='inputColorCustom' > <input style={{ width: "91%" }} className='input-field-css' id='bgColor' defaultValue={bgColor}   {...register(`${formName}bgColor`)} onChange={(e) => { setSaveBar(true), setBgColor(e.target.value) }} /> <CustomColourPicker changeColor={setBgColor} defaultColor={bgColor} setSaveBar={setSaveBar} />  </div>
                </div>

                <div>
                    <label htmlFor='fontSize'><Text variant="headingXs" as="h4"> Font Size </Text></label>
                    <input className='input-field-css' type='text' id='fontSize' placeholder='0px OR 0% OR 0rem' {...register(`${formName}fontSize`)} onChange={(e) => {
                        setSaveBar(true), setOldObj({
                            ...oldObj,
                            fontSize: e.target.value
                        })
                    }} />
                </div>

                <div style={{ columnCount: "2" }}>
                    <div>
                        <label htmlFor='borderRadius'><Text variant="headingXs" as="h4"> Border Radius</Text></label>
                        <CustomBorderRadius value={passValue} formName={formName} />
                    </div>
                    <div>
                        <label htmlFor='padding'><Text variant="headingXs" as="h4">Padding</Text></label>
                        <CustomPadding value={passValue} formName={formName} />
                    </div>
                </div>

                <div>
                    <label htmlFor='border'><Text variant="headingXs" as="h4"> Border </Text></label>
                    <div className='inputColorCustomBox boxBdr' >
                        <input id='border' style={{ width: "9%", textAlign: "center" }} placeholder='0' className='input-field-css' type='text' {...register(`${formName}borderInput`)} onChange={(e) => {
                            setSaveBar(true), setOldObj({
                                ...oldObj,
                                borderValue: e.target.value
                            })
                        }} />
                        <select style={{ marginTop: "5px" }} {...register(`${formName}borderInputUnit`)} onChange={(e) => {
                            setSaveBar(true), setOldObj({
                                ...oldObj,
                                borderUnit: e.target.value
                            })
                        }}>
                            <option value="px">px</option>
                            <option value="pt">pt</option>
                            <option value="cm">cm</option>
                            <option value="em">em</option>
                        </select>
                        <select style={{ width: "31%", marginTop: "5px" }} {...register(`${formName}borderType`)} onChange={(e) => {
                            setSaveBar(true), setOldObj({
                                ...oldObj,
                                borderType: e.target.value
                            })
                        }}>
                            <option value="dotted">Dotted</option>
                            <option value="dashed">Dashed</option>
                            <option value="solid">Solid</option>
                            <option value="double">Double</option>
                            <option value="groove">Groove</option>
                            <option value="ridge">Ridge</option>
                            <option value="inset">Inset</option>
                            <option value="outset">Outset</option>
                            <option value="hidden">Hidden</option>
                            <option value="none">None</option>
                        </select>
                        <input style={{ width: "40%" }} className='input-field-css' defaultValue={borderColor}   {...register(`${formName}notificationBorderColor`)} onChange={(e) => { setSaveBar(true), setBorderColor(e.target.value) }} />
                        <CustomColourPicker changeColor={setBorderColor} defaultColor={borderColor} setSaveBar={setSaveBar} formName={formName} />
                    </div>
                </div>

                <div>
                    <label htmlFor='textColor'><Text variant="headingXs" as="h4"> Text Color</Text></label>
                    <div className='inputColorCustom' > <input id='textColor' style={{ width: "91%" }} className='input-field-css' defaultValue={textColor}  {...register(`${formName}textColor`)} onChange={(e) => { setSaveBar(true), setTextColor(e.target.value) }} /> <CustomColourPicker changeColor={setTextColor} defaultColor={textColor} setSaveBar={setSaveBar} />  </div>
                </div>

                <div>
                    <label htmlFor='fontFamily'><Text variant="headingXs" as="h4"> Font Family</Text></label>
                    <input id='fontFamily' className='input-field-css' type='text' placeholder='Times New Roman OR Times OR serif' {...register(`${formName}fontFamily`)} onChange={(e) => {
                        setSaveBar(true), setOldObj({
                            ...oldObj,
                            fontFamily: e.target.value
                        })
                    }} />
                </div>

                <div style={{ columnCount: "2" }}>
                    <div>
                        <label htmlFor='margin' ><Text variant="headingXs" as="h4"> Margin </Text></label>
                        <CustomMargin value={passValue} formName={formName} />
                    </div>
                    <div>
                        <label htmlFor='width'><Text variant="headingXs" as="h4"> Width </Text></label>
                        <input id='width' className='input-field-css' type='text' placeholder='0px OR 0% OR auto OR none' {...register(`${formName}width`)} onChange={(e) => {
                            setSaveBar(true), setOldObj({
                                ...oldObj,
                                width: e.target.value
                            })
                        }} />
                    </div>
                </div>

                <div>
                    <label htmlFor='textAlign' ><Text variant="headingXs" as="h4"> Text Align </Text></label>
                    <select id='textAlign' style={{ width: "100%", marginTop: "5px" }} {...register(`${formName}textAlign`)} onChange={(e) => {
                        setSaveBar(true), setOldObj({
                            ...oldObj,
                            textAlign: e.target.value
                        })
                    }}>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                        <option value="center">Center</option>
                    </select>
                </div>
            </div>

            {hoverOption &&
                <div>
                    <CustomHoverSetting value={passHoverValue} formName={formName} />
                </div>}
        </>
    )
}

export default memo(CustomStyle)
