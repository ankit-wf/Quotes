import React from 'react'

const CustomBorderRadius = ({ value, formName }) => {
    const register = value.register;
    const setSaveBar = value.setSaveBar;
    const oldOldObj = value.oldOldObj;
    const setOldOldObj = value.setOldOldObj;

    return (
        <div style={{ display: "flex", marginTop: "5px" }}>

            <div className='css-input-div'>
                <input id='borderRadius' className='css-input-field' type='text' placeholder='0' {...register(`${formName}borderRadiusTopLeft`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        borderRadiusTopLeft: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "11px" }}>Top L</span>
            </div>

            <div className='css-input-div'>
                <input className='css-input-field' type='text' placeholder='0' {...register(`${formName}borderRadiusTopRight`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        borderRadiusTopRight: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "10px" }}>Top R</span>
            </div>

            <div className='css-input-div'>
                <input className='css-input-field' type='text' placeholder='0' {...register(`${formName}borderRadiusBottomRight`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        borderRadiusBottomRight: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "3px" }}>Bottom R</span>
            </div>

            <div className='css-input-div'>
                <input className='css-input-field' type='text' placeholder='0' {...register(`${formName}borderRadiusBottomLeft`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        borderRadiusBottomLeft: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "3px" }}>Bottom L</span>
            </div>

            <div className='css-input-div'>
                <select {...register(`${formName}borderRadiusUnit`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        borderRadiusUnit: e.target.value
                    })
                }}>
                    <option value="px">px</option>
                    <option value="em">em</option>
                    <option value="rem">rem</option>
                    <option value="%">%</option>
                </select>
            </div>

        </div>
    )
}

export default CustomBorderRadius
