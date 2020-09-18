import React, { useRef, useState } from 'react';

import './FileUploadField.css';

export default function FileUploadField({ onDataRecived }) {
  const [uploadedImage, setUploadedImage] = useState('');
  const image = useRef(null);

  const onChange = async (event) => {
    event.persist();

    const fileData = event.target.files?.[0];
    const src = URL.createObjectURL(fileData);
    setUploadedImage(src);

    onDataRecived && onDataRecived({ element: image.current, data: src });
  }

  return (
    <div className="field-upload">
      <input className="field-upload__input" type="file" onChange={onChange} />
      <img className="field-upload__img" id="target-image" ref={image} src={uploadedImage} alt="" />
    </div>
  );
}