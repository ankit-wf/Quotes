import { Spinner } from '@shopify/polaris';
import { useForm } from "react-hook-form";
import { useAuthenticatedFetch } from '../hooks';
import useApi from '../hooks/useApi';
import { useEffect, useState } from 'react';
import "./css/myStyle.css";
import SmallSpinner from '../hooks/SmallSpinner';

const LabelSetting = () => {
  const fetch = useAuthenticatedFetch();
  const metafieldHook = useApi();
  const [id, setId] = useState("");
  const { handleSubmit, reset, register } = useForm({});
  const [loading, setLoading] = useState(true);
  const [smallLoading, setSmallLoading] = useState(false);
  const swtAltMsg = { title: "Successfully Updated", text: "Your data has been updadted successfully", isSwtAlt: true, smallSpinner: setSmallLoading };
  
  
  
  
  useEffect(async () => {
    const metafieldId = await metafieldHook.metafield()
    setId(metafieldId)

    try {
      const response = await fetch(`/api/app-metafield/get-all?id=${metafieldId.id}`);
      const result = await response.json();
      let MetafieldArr = result.data.body.data.app.installation.metafields.edges
      MetafieldArr.find((f) => {
        if (f.node.key === "label-setting") {
          let val = JSON.parse(f.node.value)
          return reset(val)
        }
      })
      setLoading(false)
    } catch (error) {
      console.error("Error:", error);
    }

    try {
      const response = await fetch(`/api/app-metafield/get-all?id=${metafieldId.id}`);
      const result = await response.json();
      let MetafieldArr = result.data.body.data.app.installation.metafields.edges
      MetafieldArr.find((f) => {
        if (f.node.key === "grid-setting") {
          let val = JSON.parse(f.node.value)
          return reset(val)
        }
      })
    } catch (error) {
      console.error("Error:", error);
    }
  }, [])

  const onSubmit = async (data) => {
    setSmallLoading(true)
    const customerData = {
      key: "label-setting",
      namespace: "quotes-app",
      ownerId: `${id}`,
      type: "single_line_text_field",
      value: JSON.stringify(data)
    };
    await metafieldHook.createAppMetafield(customerData, swtAltMsg);
  }

  return (
    loading ?
      <div className='spinnerStyle'>
        <Spinner accessibilityLabel="Small spinner example" size="large" />
      </div>
      :
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='selectDiv'>
          <div className='selectInnerDiv'>
            <label>Label Position</label>
            <select {...register("label")} className='selectOption'>
              <option value="">Select</option>
              <option value="left_label">left_label</option>
              <option value="Placholder">Placholder</option>
              <option value="Upper_Label">Upper_Label</option>
            </select>
          </div>

          <div className='selectInnerDiv'>
            <label>Select Column</label>
            <select {...register("grid")} className='selectOption'>
              <option value="">Select</option>
              <option value="Single_Grid">One Column</option>
              <option value="Two_Grid">Two Column</option>
            </select>
          </div>

          <div className='submitButton'>
            {smallLoading ? <SmallSpinner /> : <input type="submit" />}
          </div>
        </div>
      </form>
  );
}
export default LabelSetting;

