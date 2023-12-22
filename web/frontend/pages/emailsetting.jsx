import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import AdminForm from './adminemail';
import CustomerForm from './customeremail';
import { Text } from '@shopify/polaris';


const EmailSetting = () => {
  return (
    <>
      <span className="topHeading"><Text variant="heading2xl" as="h3" >Email Setting</Text></span>
      <Tabs
        defaultActiveKey="adminform"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="customerform" title="Customer Email Setting">
          <CustomerForm />
        </Tab>
        <Tab eventKey="adminform" title="Admin Email Setting">
          <AdminForm />
        </Tab>
      </Tabs>
    </>
  )
}

export default EmailSetting;
