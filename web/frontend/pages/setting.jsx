import React from 'react';
import { LegacyCard, Tabs, Text } from '@shopify/polaris';
import { useState, useCallback } from 'react';
import HidePrice from './HidePrice';
import CancelSubscription from './CancelSubscription';
import LabelSetting from './labelSetting';
import EmailSMT from './EmailSMT';
import ButtonSetting from './ButtonSetting';

function setting() {
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: '1',
      content: 'Hide Price/Add to Cart',
      panelID: 'marketing-content-1',
    },
    {
      id: '2',
      content: 'Cancel Subscription',
      panelID: 'customers-content-1',
    },
    {
      id: '3',
      content: 'Email SMTP',
      panelID: 'content-1',
    },
    {
      id: '4',
      content: 'Input Label Settings',
      panelID: 'Label',
    },
    {
      id: '5',
      content: 'Button Setting',
      panelID: 'button-setting',
    },
    // {
    //   id: '5',
    //   content: 'Grid Settings',
    //   panelID: 'Grid',
    // },
  ];

  return (
    <>
     <span className="topHeading"><Text variant="heading2xl" as="h3" >Setting</Text></span>
      <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
        <LegacyCard.Section>
          {selected == 0 ? <HidePrice /> : ''}
          {selected == 1 ? <CancelSubscription /> : ''}
          {selected == 2 ? <EmailSMT /> : ''}
          {selected == 3 ? <LabelSetting /> : ''}
          {selected == 4 ? <ButtonSetting /> : ''}
          {/* {selected == 4 ? <GridSetting /> : ''} */}
        </LegacyCard.Section>
      </Tabs>
    </>
  );
}
export default setting

// https://ci6.googleusercontent.com/proxy/OtfvSwk5q_LWT6OGQiRziN4fCKFUFK-w2h0IIQVnOZ8kX0fSg4Ko9mIG8sqChDd8_voBT9hsiggjm7haI5kyqA1floLRW-dH3izG7vGWKfG8VPUGPowfHt2bNewmwO9kP56DmD0X2Gv7qhAcHe3NRMiRe6jE8OymMGPJ9OXdFF3YcH3fE2PYbJqSCZ9QQhXj2A=s0-d-e1-ft#https://cdn.shopify.com/s/files/1/0734/4072/3246/products/single-sprout-in-a-pot_925x_a26a8b11-9dc1-4c33-b5ee-577856930c3c.jpg