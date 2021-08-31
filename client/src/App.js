import React, { useEffect, useState } from 'react'
import Axios from 'axios'

function App() {
  const [loading, setLoading] = useState(true)
  const [fileNames, setFileNames] = useState([])

  const formats = ['image/*', '.pdf']

  const getFileNames = async () => {
    const response = await Axios.get(
      `${process.env.REACT_APP_SERVER_URL}/all-files`
    )
    setFileNames(response.data)
    setLoading(false)
  }

  const downloadFile = async (name) => {
    const url = await getFileUrl(name)

    var a = document.createElement('a')
    document.body.appendChild(a)
    a.style = 'display: none'

    a.href = url
    a.download = name
    a.click()
  }

  const getFileUrl = async (name) => {
    const response = await Axios.get(
      `${process.env.REACT_APP_SERVER_URL}/files?filename=${name}`
    )
    return response.data
  }

  useEffect(() => {
    getFileNames()
  }, [])

  return (
    <div className='App' style={{ display: 'flex', flexDirection: 'column' }}>
      <form
        method='POST'
        action={`${process.env.REACT_APP_SERVER_URL}/upload`}
        encType='multipart/form-data'
      >
        <div className='field'>
          <label htmlFor='file'>File Upload</label>
          <input type='file' name='file' id='file' accept={formats.join(',')} />
        </div>
        <input type='submit' className='btn' value='Save' />
      </form>
      <button onClick={() => getFileNames()}>Get All Files</button>
      {!loading &&
        fileNames.map((file, idx) => {
          return (
            <span
              key={idx}
              download={`${file.Key}`}
              onClick={() => {
                downloadFile(file.Key)
              }}
            >
              {`${file.Key.split('.')[0]} -> ${file.Key.split('.')[1]}`}
            </span>
          )
        })}
    </div>
  )
}

export default App
