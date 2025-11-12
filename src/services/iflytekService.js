// 科大讯飞语音识别服务
import CryptoJS from 'crypto-js'

class IFlytekSpeechRecognizer {
  constructor() {
    // 从环境变量获取配置信息
    this.APPID = import.meta.env.VITE_IFLYTEK_APPID
    this.APISecret = import.meta.env.VITE_IFLYTEK_APISECRET
    this.APIKey = import.meta.env.VITE_IFLYTEK_APIKEY
    
    this.host = 'wss://iat-api.xfyun.cn/v2/iat'
    this.socket = null
  }

  // 生成RFC1123格式的时间戳
  getDate() {
    const date = new Date().toUTCString()
    return date
  }

  // 获取RFC1123格式时间戳
  getGMTISO8601() {
    return new Date().toUTCString()
  }

  // 生成签名
  getAuthStr(date) {
    const signatureOrigin = `host: iat-api.xfyun.cn\ndate: ${date}\nGET /v2/iat HTTP/1.1`
    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, this.APISecret)
    const signature = CryptoJS.enc.Base64.stringify(signatureSha)
    const authorizationOrigin = `api_key="${this.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    const authStr = btoa(authorizationOrigin)
    return authStr
  }

  // 初始化WebSocket连接
  initWebSocket(onResultCallback) {
    const date = this.getDate()
    const authStr = this.getAuthStr(date)
    
    const url = `${this.host}?authorization=${authStr}&date=${date}&host=iat-api.xfyun.cn`
    
    return new Promise((resolve, reject) => {
      if ("WebSocket" in window) {
        this.socket = new WebSocket(url)
      } else if ("MozWebSocket" in window) {
        this.socket = new MozWebSocket(url)
      } else {
        alert("浏览器不支持WebSocket")
        return
      }
      
      this.socket.onopen = (e) => {
        console.log('WebSocket 连接已建立')
        // 发送初始参数
        const params = {
          common: {
            app_id: this.APPID,
          },
          business: {
            language: "zh_cn",
            domain: "iat",
            accent: "mandarin",
            vad_eos: 5000,
            dwa: "wpgs",
          },
          data: {
            status: 0,
            format: "audio/L16;rate=16000",
            encoding: "raw",
          },
        }
        this.socket.send(JSON.stringify(params))
        resolve()
      }
      
      this.socket.onmessage = (e) => {
        this.handleMessage(e.data, onResultCallback)
      }
      
      this.socket.onerror = (error) => {
        console.error('WebSocket 错误:', error)
        reject(error)
      }
      
      this.socket.onclose = () => {
        console.log('WebSocket 连接已关闭')
      }
    })
  }

  // 将buffer转换为base64
  toBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // 发送音频数据
  sendAudioData(frameBuffer, isLastFrame) {
    if (!this.socket || this.socket.readyState !== this.socket.OPEN) {
      console.error('WebSocket 连接未建立')
      return
    }

    // 如果是最后一帧且没有数据，则发送结束标识
    if (isLastFrame && (!frameBuffer || frameBuffer.byteLength === 0)) {
      this.socket.send(
        JSON.stringify({
          data: {
            status: 2,
            format: "audio/L16;rate=16000",
            encoding: "raw",
            audio: ""
          },
        })
      )
    } else if (frameBuffer && frameBuffer.byteLength > 0) {
      // 只有当有实际数据时才发送
      this.socket.send(
        JSON.stringify({
          data: {
            status: isLastFrame ? 2 : 1,
            format: "audio/L16;rate=16000",
            encoding: "raw",
            audio: this.toBase64(frameBuffer),
          },
        })
      )
    } else if (isLastFrame) {
      // 如果是最后一帧但没有数据，也发送结束标识
      this.socket.send(
        JSON.stringify({
          data: {
            status: 2,
            format: "audio/L16;rate=16000",
            encoding: "raw",
            audio: ""
          },
        })
      )
    }
  }

  // 处理返回消息
  handleMessage(resultData, onResultCallback) {
    // 识别结束
    let jsonData = JSON.parse(resultData)
    if (jsonData.code !== 0) {
      console.error('识别错误:', jsonData)
      this.socket.close()
      return
    }
    
    let resultText = ""
    let resultTextTemp = ""
    let hasResult = false
    
    if (jsonData.data && jsonData.data.result) {
      let data = jsonData.data.result
      let str = ""
      let ws = data.ws
      for (let i = 0; i < ws.length; i++) {
        str = str + ws[i].cw[0].w
      }
      
      if (str.length > 0 && str.trim() !== '' && str.trim() !== '。') {
        hasResult = true
      }
      
      // 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
      // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段
      if (data.pgs) {
        if (data.pgs === "apd") {
          // 将resultTextTemp同步给resultText
          resultText = resultTextTemp
        }
        // 将结果存储在resultTextTemp中
        resultTextTemp = resultText + str
      } else {
        resultText = resultText + str
      }
      
      // 调用回调函数传递识别结果
      // 只有在有实际内容且不是单纯的句号时才调用回调函数
      if (onResultCallback && (resultTextTemp || resultText) && (resultTextTemp || resultText).trim() !== '' && (resultTextTemp || resultText).trim() !== '.') {
        onResultCallback(resultTextTemp || resultText, jsonData.data.status === 2)
      }
    }
    
    if (jsonData.code === 0 && jsonData.data.status === 2) {
      this.socket.close()
      // 识别结束时的处理
      // 如果有识别结果且不是单纯的句号，则调用回调函数
      if (onResultCallback && hasResult && (resultTextTemp || resultText) && (resultTextTemp || resultText).trim() !== '' && (resultTextTemp || resultText).trim() !== '.') {
        onResultCallback(resultTextTemp || resultText, true)
      }
      // 如果没有识别结果，不调用回调函数，避免影响已有的内容
    }
  }
}

// 录音管理器
class RecorderManager {
  constructor() {
    this.sampleRate = 16000
    // 使用符合AudioContext要求的bufferSize值（必须是256到16384之间的2的幂）
    this.bufferSize = 4096
    this.audioContext = null
    this.mediaStream = null
    this.scriptProcessor = null
    this.mediaStreamSource = null
    this.isRecording = false
    this.onStart = null
    this.onStop = null
    this.onFrameRecorded = null
  }

  async start(options = {}) {
    this.sampleRate = options.sampleRate || 16000
    // 使用有效的bufferSize值
    this.bufferSize = options.bufferSize || 4096

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.mediaStream = stream
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: this.sampleRate })
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream)
      // 使用有效的bufferSize、inputChannelCount和outputChannelCount参数
      this.scriptProcessor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1)
      
      this.mediaStreamSource.connect(this.scriptProcessor)
      this.scriptProcessor.connect(this.audioContext.destination)
      
      let buffer = []
      // 保存buffer引用，以便在stop时使用
      this.audioBuffer = buffer
      
      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.isRecording) return
        
        const inputData = e.inputBuffer.getChannelData(0)
        const pcmData = this.float32ToS16(inputData)
        
        buffer = buffer.concat(Array.from(pcmData))
        // 更新保存的buffer引用
        this.audioBuffer = buffer
        
        // 按照科大讯飞要求，每次发送1280字节数据
        while (buffer.length >= 1280) {
          const frame = buffer.slice(0, 1280)
          buffer = buffer.slice(1280)
          // 更新保存的buffer引用
          this.audioBuffer = buffer
          
          if (this.onFrameRecorded) {
            this.onFrameRecorded({
              isLastFrame: false,
              frameBuffer: this.toArrayBuffer(new Int16Array(frame))
            })
          }
        }
      }
      
      this.isRecording = true
      if (this.onStart) this.onStart()
    } catch (error) {
      console.error('录音启动失败:', error)
    }
  }

  stop() {
    if (!this.isRecording) return
    
    this.isRecording = false
    
    // 处理缓冲区中剩余的数据
    if (this.onFrameRecorded && this.audioBuffer && this.audioBuffer.length > 0) {
      // 发送剩余的数据
      const frame = this.audioBuffer.slice(0, 1280)
      if (frame.length > 0) {
        this.onFrameRecorded({
          isLastFrame: false,
          frameBuffer: this.toArrayBuffer(new Int16Array(frame))
        })
      }
    }
    
    // 发送最后一帧
    if (this.onFrameRecorded) {
      this.onFrameRecorded({
        isLastFrame: true,
        frameBuffer: new ArrayBuffer(0)
      })
    }
    
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect()
    }
    
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect()
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
    }
    
    if (this.onStop) this.onStop()
  }

  float32ToS16(float32Array) {
    const int16Array = new Int16Array(float32Array.length)
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]))
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }
    return int16Array
  }

  toArrayBuffer(int16Array) {
    const buffer = new ArrayBuffer(int16Array.length * 2)
    const view = new DataView(buffer)
    for (let i = 0; i < int16Array.length; i++) {
      view.setInt16(i * 2, int16Array[i], true)
    }
    return buffer
  }
}

let recognizer = null
let recorder = null

// 初始化语音识别器
export async function initSpeechRecognition(onResultCallback) {
  if (!recognizer) {
    recognizer = new IFlytekSpeechRecognizer()
  }
  
  if (!recorder) {
    recorder = new RecorderManager()
    recorder.onFrameRecorded = ({ isLastFrame, frameBuffer }) => {
      if (recognizer.socket && recognizer.socket.readyState === recognizer.socket.OPEN) {
        recognizer.sendAudioData(frameBuffer, isLastFrame)
      }
    }
  }
  
  try {
    await recognizer.initWebSocket(onResultCallback)
    recorder.start({
      sampleRate: 16000,
      bufferSize: 4096,
    })
    return recognizer
  } catch (error) {
    console.error('初始化语音识别失败:', error)
    throw error
  }
}

// 结束识别
export function endSpeechRecognition() {
  if (recorder) {
    recorder.stop()
  }
}