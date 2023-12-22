import { Checkbox, Spinner, Text, RadioButton,Frame } from '@shopify/polaris';
import { useForm, Controller } from "react-hook-form";
import { useAuthenticatedFetch } from '../hooks';
import useApi from '../hooks/useApi';
import { useEffect, useState } from 'react';
import "./css/myStyle.css";
import useToast from '../hooks/useToast';

const HidePrice = () => {
  const fetch = useAuthenticatedFetch();
  const metafieldHook = useApi();
  const [id, setId] = useState("");
  const { handleSubmit, control, reset } = useForm({});
  const [loading, setLoading] = useState(true);
  const swtAltMsg = { title: "Successfully Updated", text: "Youe data has been updadted successfully", isSwtAlt: true };
  const [msg, setMsg] = useState("");
  const toast = useToast(msg);

  useEffect(async () => {
    const metafieldId = await metafieldHook.metafield();
    setId(metafieldId);
    try {
      const response = await fetch(`/api/app-metafield/get-all?id=${metafieldId.id}`);
      const result = await response.json();
      let arr = result.data.body.data.app.installation.metafields.edges
      arr.find((f) => {
        if (f.node.key === "priceCSS") {
          let avv = JSON.parse(f.node.value)
          return reset(avv)
        }
      })
      setLoading(false)
    } catch (error) {
      console.error("Error:", error);
    }
  }, [])


  const onSubmit = async (data) => {
  
    const customerData = {
      key: "priceCSS",
      namespace: "quotes-app",
      ownerId: `${id}`,
      type: "single_line_text_field",
      value: JSON.stringify(data)
    };
    try {
      const response = await fetch("/api/app-metafield/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });
      const result = await response.json();
      if (result.status === "success") {
        toast.setActive(!toast.active)
        toast.toggleActive
        setMsg("Data Saved Sucessfully")
      }

    } catch (error) {
      console.error("Error:", error);
    }
    // await metafieldHook.createAppMetafield(customerData, swtAltMsg);
  }

  return (
    loading ?
      <div className='spinnerStyle'>
        <Spinner accessibilityLabel="Small spinner example" size="large" />
      </div>
      :
      <>
      <div className='frameToast'>
      <Frame style={{ minHeight: 0 }}>
          {toast.toastMarkup}
      </Frame>
  </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='controllerDiv'>
          <Controller
            name="AddToCart"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                label="Hide Add To Cart Button"
                checked={value}
                onChange={onChange}
              />
            )}
          />
        </div>
        <br />


        <span className="topHeading">
          <Text variant="headingMd" as="h5">
            Hide Price
          </Text>
        </span>

        <div className='controllerDiv'>
          <Controller
            name="hidePrice"
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <>
                <RadioButton
                  label="Hide Price For Everyone"
                  checked={value === 'Hide price for everyone'}
                  id="Hide price for everyone"
                  onChange={() => onChange('Hide price for everyone')}
                /><br />
                <RadioButton
                  label="Hide Price For Guest Users"
                  checked={value === 'Hide price for guest users'}
                  id="Hide price for guest users"
                  onChange={() => onChange('Hide price for guest users')}
                /><br />
                <RadioButton
                  label="Everyone Can See Price"
                  checked={value === 'Everyone can see price'}
                  id="Everyone can see price"
                  onChange={() => onChange('Everyone can see price')}
                />
              </>
            )}
          />
        </div>

        <div className="submitButton">
          <input type="submit" />
        </div>
      </form>
      </>
  );
}
export default HidePrice;