import React, { useState } from 'react';
import { Text, Collapsible } from '@shopify/polaris';
import CustomColourPicker from './CustomColourPicker';

const CustomHoverSetting = ({ value, formName }) => {
    const register = value.register;
    const setSaveBar = value.setSaveBar;
    const hoverBgColor = value.hoverBgColor;
    const setHoverBgColor = value.setHoverBgColor;
    const hoverTextColor = value.hoverTextColor;
    const setHoverTextColor = value.setHoverTextColor;
    const hoverBorderColor = value.hoverBorderColor;
    const setHoverBorderColor = value.setHoverBorderColor;
    const hoverBox = value.hoverBox;
    const setHoverBox = value.setHoverBox;
    const oldOldObj = value.oldOldObj;
    const setOldOldObj = value.setOldOldObj;

    return (
        <>
            <label htmlFor='hoverValue' ><Text variant="headingXs" as="h4"> Hover </Text></label>
            <select id='hoverValue' style={{ width: "50%", marginTop: "5px", marginBottom: "10px" }} {...register(`${formName}hover`)} onChange={(e) => { setSaveBar(true), setHoverBox(e.target.value) }}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </select>




            <Collapsible open={hoverBox === "yes" ? true : false} id="basic-collapsible collapse-hover" transition={{ duration: '500ms', timingFunction: 'ease-in-out' }} expandOnPrint>
                <div className='toggleBox' >
                    <div style={{ columnCount: "2" }}>
                        <div>
                            <label htmlFor="hoverBgColor"><Text variant="headingXs" as="h4" > Background color </Text></label>
                            <div className='inputColorCustomBox hoverBg' > <input style={{ width: "80%" }} className='input-field-css' id='hoverBgColor' defaultValue={hoverBgColor}   {...register(`${formName}hoverBgColor`)} onChange={(e) => { setSaveBar(true), setHoverBgColor(e.target.value) }} /> <CustomColourPicker changeColor={setHoverBgColor} defaultColor={hoverBgColor} setSaveBar={setSaveBar} />  </div>
                        </div>
                        <div>
                            <label htmlFor="hoverTextColor"><Text variant="headingXs" as="h4" > Text color </Text></label>
                            <div className='inputColorCustomBox hoverText' > <input style={{ width: "80%" }} className='input-field-css' id='hoverTextColor' defaultValue={hoverTextColor}   {...register(`${formName}hoverTextColor`)} onChange={(e) => { setSaveBar(true), setHoverTextColor(e.target.value) }} /> <CustomColourPicker changeColor={setHoverTextColor} defaultColor={hoverTextColor} setSaveBar={setSaveBar} />  </div>
                        </div>
                    </div>

                    <div>
                        <div>
                            <label htmlFor='hoverBorder'><Text variant="headingXs" as="h4"> Border </Text></label>
                            <div className='inputColorCustomBox hoverBdr' >
                                <input id='hoverBorder' style={{ width: "9%", textAlign: "center" }} placeholder='0' className='input-field-css' type='text' {...register(`${formName}hoverBorderInput`)} onChange={(e) => {
                                    setSaveBar(true), setOldOldObj({
                                        ...oldOldObj,
                                        hoverBorderValue: e.target.value
                                    })
                                }} />
                                <select style={{ marginTop: "5px" }} {...register(`${formName}hoverBorderInputUnit`)} onChange={(e) => {
                                    setSaveBar(true), setOldOldObj({
                                        ...oldOldObj,
                                        hoverBorderUnit: e.target.value
                                    })
                                }}>
                                    <option value="px">px</option>
                                    <option value="pt">pt</option>
                                    <option value="cm">cm</option>
                                    <option value="em">em</option>
                                </select>
                                <select style={{ width: "31%", marginTop: "5px" }} {...register(`${formName}hoverBorderType`)} onChange={(e) => {
                                    setSaveBar(true), setOldOldObj({
                                        ...oldOldObj,
                                        hoverBorderType: e.target.value
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
                                <input style={{ width: "40%" }} className='input-field-css' defaultValue={hoverBorderColor}   {...register(`${formName}hoverBorderColor`)} onChange={(e) => { setSaveBar(true), setHoverBorderColor(e.target.value) }} />
                                <CustomColourPicker changeColor={setHoverBorderColor} defaultColor={hoverBorderColor} setSaveBar={setSaveBar} />
                            </div>
                        </div>
                    </div>

                </div>
            </Collapsible>





        </>
    )
}

export default CustomHoverSetting
