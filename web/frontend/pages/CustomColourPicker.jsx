import React, { useState, useRef, useEffect } from 'react';
import { ColorPicker } from '@shopify/polaris';

const CustomColourPicker = (props) => {

    const [color, setColor] = useState({ hue: 120, brightness: 1, saturation: 1, });
    const [openBox, setOpenBox] = useState(false);
    const ref = useRef(null);

    const RGBconverter = (value) => {
        setColor(value);
        const colorName = extractColorRGB(value);
        props.changeColor(colorName);
        props.setSaveBar(true);
    }

    function extractColorRGB(data) {
        let h = data.hue;
        let s = data.saturation;
        let b = data.brightness;
        const k = (n) => (n + h / 60) % 6;
        const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
        const final = [255 * f(5), 255 * f(3), 255 * f(1)];
        let rr = Math.round(final[0]);
        let gg = Math.round(final[1]);
        let bb = Math.round(final[2]);
        let endResult = `rgb(${rr}, ${gg}, ${bb})`
        return endResult
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            // console.log("GGGGGG ", event.target)
            // console.log("KKKKKKKKKKK ", !ref.current.contains(event.target))
            if (!ref.current.contains(event.target)) {
                setOpenBox(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
    }, [ref]);


    return (
        <div ref={ref} style={{ position: "relative" }}>
            <div style={{ backgroundColor: props.defaultColor }} onClick={() => setOpenBox(true)} className='color-selector'></div>
            {openBox && <div className='customColorBox'>
                <span onClick={() => setOpenBox(false)}>X</span>
                <ColorPicker onChange={RGBconverter} color={color} />
            </div>}
        </div>
    )
}

export default CustomColourPicker
