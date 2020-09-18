import React from 'react';
import { AppBar, Tab, Tabs, Card } from '@material-ui/core';

import TabField from './TabField/TabField';

export default function TabPanel({ tabs, children, onTabChange }) {
  const [value, setValue] = React.useState(0);

  const handleChange = async (event, newValue) => {
    await onTabChange();
    setValue(newValue);
  };

  return (
    <Card>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {tabs.map(tabName => (
            <Tab label={tabName} />
          ))}
        </Tabs>
      </AppBar>
        {children.map((child, index) => (
          <TabField value={value} index={index}>
            {child}
          </TabField>
        ))}
    </Card>
  );
}