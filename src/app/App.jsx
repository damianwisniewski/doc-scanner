import React, { useState, useRef } from 'react';
import { Box } from '@material-ui/core';
import { withSnackbar } from 'notistack';

import FileUploadField from '../components/FileUploadField/FileUploadField';
import JSONOutput from '../components/JSONOutput/JSONOutput';
import TabPanel from '../components/TabPanel/TabPanel';
import VideoField from '../components/VideoField/VideoField';
import BasicInfo from '../components/BasicInfo/BasicInfo';

import Recognizer from '../services/Recognizer';

import './App.css';

function App({ enqueueSnackbar }) {
  const [detectionOutput, setDetecrionOutput] = useState('No output data');
  const [basicInfo, setBasicInfo] = useState({
    firstName: '---',
    surname: '---',
    documentNumber: '---',
    gender: '---',
    issuerName: '---',
    nationalityName: '---',
    documentType: '---',
    dateOfBirth: '---',
    dateOfExpiry: '---',
  });

  const [recognizerEl, setRecognizerEl] = useState(null);

  const createDate = ({ day, month, year}) => (
    `${day > 9 ? day : `0${day}`} - ${month > 9 ? month : `0${month}`} - ${year}`
  );

  const startRecognize = async ({ element, data, feedbackElem }) => {
    enqueueSnackbar('Scanning data started...', { variant: 'info' });

    try {
      const recognizer = new Recognizer();
      setRecognizerEl(recognizer);

      await recognizer.init({
        onScanFeedback: (data) => enqueueSnackbar(data, { variant: 'warning' }),
      });
      const result = await recognizer.scan(element, data, feedbackElem);
    
      enqueueSnackbar('Scanning succeeded!', { variant: 'success' });
  
      setDetecrionOutput(result);
      setBasicInfo({
        firstName: result.mrz.secondaryID,
        surname: result.mrz.primaryID,
        documentNumber: result.mrz.sanitizedDocumentNumber,
        gender: result.mrz.gender,
        country: result.mrz.issuerName,
        nationality: result.mrz.nationalityName,
        documentType: result.mrz.sanitizedDocumentCode,
        dateOfBirth: createDate(result.mrz.dateOfBirth),
        dateOfExpiry: createDate(result.mrz.dateOfExpiry),
      })
    } catch (err) {
      enqueueSnackbar(`Scanning failed! \n ${err}`, { variant: 'error' });
    }
  }

  const onTabChange = async () => {
    await recognizerEl?.clears?.releaseCamera?.();
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Document scanner POC</h1>
      </header>
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="space-evenly"
        margin={2}
        className="app-fields"
      >
        <TabPanel
          onTabChange={onTabChange}
          tabs={[
            'Read data from photo',
            'Read data from video',
          ]}
        >
          <FileUploadField onDataRecived={startRecognize} />
          <VideoField onVideoStarted={startRecognize} recognizer={recognizerEl}></VideoField>
        </TabPanel>
        <BasicInfo data={basicInfo} />
      </Box>
      <JSONOutput output={detectionOutput} />
    </div>
  );
}

export default withSnackbar(App);
