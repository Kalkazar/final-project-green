import axios from 'axios'


const localPath = "http://localhost:8080/"

const axiosGet = (url, params) => {
  return axios.get(localPath+url, {params: params})
    .then(response => response.data)
}
const axiosDelete = (url, params) => {
  return axios.delete(localPath+url, {params: params})
    .then(response => response.data);
}
const axiosPost = (url, data, header={}) => {
  return axios.post(localPath+url, data, {headers: header})
    .then(response => response.data)
}
const axiosPatch = (url, params) => {
  return axios.patch(localPath+url, {params: params})
    .then(response => response.data)
}


export const uploadFile = (data) =>
  axiosPost(`upload/file`, data)
export const uploadFiles = (data) => {
  let config = { 'Content-Type': 'multipart/form-data' }
  return axios.post(localPath+`upload/files`, data, {headers: config})
  //axiosPost(`upload/files`, data, header)
  }

export const downloadFile = (fileId) =>
  axiosGet(`download/files/${fileId}`,{})
export const downloadFolder = (folderId) =>
  axiosGet('download/folder',{folderId: folderId})


export const deleteFile = (fileId) =>
  axiosDelete('edit/delete/file',{fileId: fileId})
export const deleteFolder = (folderId) =>
  axiosDelete('edit/delete/folder',{folderId: folderId})

export const createFolder = (parentFolderId, folderName) =>
  axiosPost(`edit/create/${folderName}?parentFolderId=${parentFolderId}`,{})

export const moveFile = (fileId, locationFolderId) =>
  axiosPatch('edit/move/file',{fileId: fileId, locationFolderId: locationFolderId})
export const moveFolder = (folderId, locationFolderId) =>
  axiosPatch('edit/move/folder',{folderId: folderId, locationFolderId: locationFolderId})

export const renameFile = (fileId, newName) =>
  axiosPatch('edit/rename/file', {fileId: fileId, newName: newName})
export const renameFolder = (folderId, newName) =>
  axiosPatch('edit/rename/folder', {folderId: folderId, newName: newName})

export const view = (id) =>
  axiosGet(`view/${id}`)