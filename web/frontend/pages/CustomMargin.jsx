import React from 'react'

const CustomMargin = ({ value, formName }) => {
    const register = value.register;
    const setSaveBar = value.setSaveBar;
    const oldOldObj = value.oldOldObj;
    const setOldOldObj = value.setOldOldObj;

    return (
        <div style={{ display: "flex", marginTop: "5px" }}>

            <div className='css-input-div'>
                <input id='margin' className='css-input-field' type='text' placeholder='0' {...register(`${formName}marginTop`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        marginTop: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "14px" }}>Top</span>
            </div>

            <div className='css-input-div'>
                <input className='css-input-field' type='text' placeholder='0' {...register(`${formName}marginRight`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        marginRight: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "10px" }}>Right</span>
            </div>

            <div className='css-input-div'>
                <input className='css-input-field' type='text' placeholder='0' {...register(`${formName}marginBottom`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        marginBottom: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "6px" }}>Bottom</span>
            </div>

            <div className='css-input-div'>
                <input className='css-input-field' type='text' placeholder='0' {...register(`${formName}marginLeft`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        marginLeft: e.target.value
                    })
                }} /> <br />
                <span className='css-input-label' style={{ left: "14px" }}>Left</span>
            </div>

            <div className='css-input-div'>
                <select {...register(`${formName}marginUnit`)} onChange={(e) => {
                    setSaveBar(true), setOldOldObj({
                        ...oldOldObj,
                        marginUnit: e.target.value
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

export default CustomMargin
