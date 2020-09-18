import React from 'react';
import { Card, Box, CardContent, Typography } from '@material-ui/core';

export default function SimpleInfo({ data }) {
  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          Simple info
        </Typography>

        <Box textAlign="left">
          {Object.entries(data).map(([key, value]) => (
            <Typography variant="body2" component="p">
              {`${key}: ${value}`}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
