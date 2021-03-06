import React, { Component } from "react";
import PropTypes from 'prop-types'
import connect from 'react-redux/es/connect/connect'
import ReactDropzone from "react-dropzone";
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItem,
  Slide } from '@material-ui/core'
import { fromEvent } from 'file-selector'
import { createFolder } from '../../services/api'
import {
  fetchFileTreeFromDatabase,
  uploadFiles,
  loadSuccess,
  loadError
} from '../../ducks/filetree.duck'

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class Upload extends Component {
  constructor() {
    super()
    this.state = {
      open: false
    }
  }

  state = {
    open: false,
  }

  handleOpen = () => {
    if(!this.state.open) {
      this.setState({ 
        ...this.state,  
        open: true 
      });
    }
  }

  handleClose = () => {
    this.setState({ 
      ...this.state,
      open: false 
    })
  }

  onDrop = (accepted, rejected) => {

    //Creating files in the database
    const createFiles = (accepted,rejected,data) => {
      if (rejected.length) {
        //Log rejected files
        this.props.loadError('Some files were rejected')
        console.log("rejected")
        console.log(rejected)
      } else {
        //Put accepted files into the data Form
        for(let t of accepted) {
          data.append('files', t)
        }

        //send file(s) to DB
        this.props.uploadFiles(data)
      }
    }

    //Uploading folders
    const createFolders = (accepted, rejected, parentFolderId, folderName, index) => {
      //First create a folder
      createFolder(parentFolderId, folderName)
        .then(response => {
          //Set created folder as parent
          let folderId = response.id;
          let data = new FormData()
          data.append('folderId', folderId)
          if (rejected.length) {
            //log Rejected files
            console.log("rejected")
            console.log(rejected)
            this.props.loadError('Some files were rejected')
          } else {
            //Divide accepted files into ones in current folder and ones in sub folders
            let files = accepted.filter(f => f.path.split('/').length <= 3 + index)
            let folders = accepted.filter(f => f.path.split('/').length > 3 + index)
            //Put files in current folder into data form
            for(let f of files) {
              data.append('files', f)
            }
            //Find the subfolders in the current folder
            let subFolder = {};
            for(let f of folders) {
              let sub = f.path.split('/')[index+2]
              if(subFolder.hasOwnProperty(sub)) {
                subFolder[sub].push(f)
              } else {
                subFolder[sub] = [f];
              }
            }
            //For each folder recursively create folders
            for(let k in subFolder) {
              createFolders(subFolder[k], [], folderId, k, index + 1)
            }
    
            //send file(s) to DB
            this.props.uploadFiles(data)
          }
        })
        .catch(err => {
          this.props.loadError(err.message)
          console.log(err)
        })
    }
    //Size of accepted files
    let size = 0
    for(let file of accepted){
      size += file.size
      if((size/1024/1024) > 50){
        break
      }
    }
    size = size/1024/1024
    //If size is to large return error
    if(size > 50){
      this.props.loadError('File cannot exceed 50 MB')
    }else{
      //Split the upload request to see if the files are in a folder or not
      let split = accepted[0].path.split('/')
      let folderName
      let parentFolderId = 1;
      if(this.props.selectedFolder !== null) {
        parentFolderId = this.props.selectedFolder
      }
      if(split.length > 2){
        //upload folders
        folderName = split[1]
        //create folder in DB get back folder ID
        createFolders(accepted, rejected, parentFolderId, folderName, 0)
      }else{
        //upload files
        let data = new FormData();
        data.append('folderId', parentFolderId)
        createFiles(accepted,rejected,data)
      }
      //Close and print success message
      this.handleClose();
      this.props.loadSuccess('File uploaded successfully')
    }
  }

  render() {
    return (
      <ListItem button onClick = {this.handleOpen}>
        {this.props.children}
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          TransitionComponent={Transition}
          keepMounted
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
          scroll="paper"
        >
          <DialogTitle style={{ textAlign: 'center' }}>
            Upload File
          </DialogTitle>
          <DialogContent>
            <ReactDropzone 
              className='dropzone'
              getDataTransferItems={evt => fromEvent(evt)}
              onDrop={this.onDrop}
            >
              <DialogContentText style={{position: 'relative', top: '50%', textAlign: 'center'}}>
                Drag files or click to browse
              </DialogContentText>
            </ReactDropzone>
          </DialogContent>
          <Button onClick={this.handleClose} color="primary">
            Close
          </Button>
        </Dialog>
      </ListItem>
    );
  }
}

Upload.propTypes = {
  selectedFolder: PropTypes.number,
  fetchFileTreeFromDatabase: PropTypes.func.isRequired,
  uploadFiles: PropTypes.func.isRequired,
  loadSuccess: PropTypes.func.isRequired,
  loadError: PropTypes.func.isRequired,
  children: PropTypes.array
}

const mapStateToProps = state => ({
  selectedFolder: state.selectedFolder
})
const mapDispatchToProps = ({
  fetchFileTreeFromDatabase,
  uploadFiles,
  loadSuccess,
  loadError
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Upload)