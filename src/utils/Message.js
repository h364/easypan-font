import { ElMessage } from 'element-plus'

const showMessasge = (msg, callback, type) => {
    ElMessage({
        type: type,
        message: msg,
        duration: 2000,
        onClose: () => {
            if(callback) {
                callback()
            }
        }
    })
}

const message = {
    error: (msg, callback) => {
        showMessasge(msg, callback, "error")
    },
    success: (msg, callback) => {
        showMessasge(msg, callback, "success")
    },
    warning: (msg, callback) => {
        showMessasge(msg, callback, "warning")
    },
}

export default message