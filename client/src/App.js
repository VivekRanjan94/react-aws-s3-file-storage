import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import { Document, Page } from 'react-pdf'

function App() {
  const [loading, setLoading] = useState(true)
  const [fileNames, setFileNames] = useState([])
  const [url, setUrl] = useState('')

  const formats = ['image/*', '.pdf']

  const getFileNames = async () => {
    const response = await Axios.get(
      `${process.env.REACT_APP_SERVER_URL}/all-files`
    )
    setFileNames(response.data)
    setLoading(false)
  }

  const openFile = async (name) => {
    const url = await getFileUrl(name)

    var a = document.createElement('a')
    document.body.appendChild(a)
    a.style = 'display: none'

    a.href = url
    a.target = '_blank'
    // a.download = name
    a.click()
  }

  const getFileUrl = async (name) => {
    const response = await Axios.get(
      `${process.env.REACT_APP_SERVER_URL}/files?filename=${name}`
    )
    const data = response.data
    setUrl(data)
  }

  useEffect(() => {
    getFileUrl('MonthlyInsights.pdf')
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
          console.log(file)
          const name = file.Key.split('.')[0]
          const ext = file.Key.split('.')[1] || 'folder'
          return (
            <span
              key={idx}
              onClick={
                ext !== 'folder'
                  ? () => {
                      openFile(file.Key)
                    }
                  : null
              }
            >
              {`${name} -> ${ext}`}
            </span>
          )
        })}
      <a href={url}>monthly insights</a>
    </div>
  )
}

export default App
