import React from 'react'

const CustomPadding = ({ value, formName }) => {
    const register = value.register;
    const setSaveBar = value.setSaveBar;
    const oldOldObj = value.oldOldObj;
    const setOldOldObj = value.setOldOldObj;

    return (
        <div style={{ display: "flex", marginTop: "5px" }}>

            <div className='css-input-div'>
                <input id='padding' className='css-input-field' type='text' placeholder='0' {...register(`${formName}paddingTop`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        paddingTop: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "14px" }}>Top</span>
            </div>

            <div className='css-input-div'>
                <input className='css-input-field' type='text' placeholder='0' {...register(`${formName}paddingRight`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        paddingRight: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "10px" }}>Right</span>
            </div>

            <div className='css-input-div'>
                <input className='css-input-field' type='text' placeholder='0' {...register(`${formName}paddingBottom`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        paddingBottom: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "6px" }}>Bottom</span>
            </div>

            <div className='css-input-div'>
                <input className='css-input-field' type='text' placeholder='0' {...register(`${formName}paddingLeft`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        paddingLeft: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "14px" }}>Left</span>
            </div>

            <div className='css-input-div'>
                <select {...register(`${formName}paddingUnit`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        paddingUnit: e.target.value
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

export default CustomPadding
