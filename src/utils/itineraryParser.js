/**
 * 解析大模型返回的行程数据
 * @param {string} planText - 大模型返回的行程文本
 * @returns {Array} 解析后的行程数据
 */
export function parseItinerary(planText) {
  if (!planText) return []
  
  const itinerary = []
  const lines = planText.split('\n')
  
  let currentDay = null
  let places = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 匹配"第N天"的行
    const dayMatch = line.match(/^[-\s]*第(\d+)天[：:]?/)
    if (dayMatch) {
      // 如果之前有收集到天数信息，保存它
      if (currentDay !== null) {
        itinerary.push({
          day: currentDay,
          places: [...places]
        })
      }
      
      // 开始新的一天
      currentDay = parseInt(dayMatch[1])
      places = []
      continue
    }
    
    // 如果当前在某一天的行程中，收集景点信息
    if (currentDay !== null) {
      // 匹配景点描述（以"上午"、"中午"、"下午"、"晚上"开头的行）
      const timeMatch = line.match(/^[-\s]*(上午|中午|下午|晚上)[：:]?(.*)/)
      if (timeMatch) {
        // 提取景点名称（冒号后的内容）
        const placeText = timeMatch[2].trim()
        if (placeText) {
          // 提取可能的景点名称
          const extractedPlaces = extractPlaceNames(placeText)
          extractedPlaces.forEach(place => {
            if (place && !places.includes(place)) {
              places.push(place)
            }
          })
        }
      }
    }
  }
  
  // 保存最后一天的行程
  if (currentDay !== null) {
    itinerary.push({
      day: currentDay,
      places: [...places]
    })
  }
  
  return itinerary
}

/**
 * 从文本中提取多个景点名称
 * @param {string} text - 包含景点描述的文本
 * @returns {Array} 提取的景点名称数组
 */
function extractPlaceNames(text) {
  if (!text) return []
  
  const places = []
  
  // 常见的景点和餐厅关键词
  const placeKeywords = [
    '老门东历史文化街区', '夫子庙秦淮河风光带', '中山陵', '明孝陵', '石象路', 
    '总统府', '颐和路公馆区', '玄武湖公园', '南京博物院', '先锋书店', '1912街区',
    '鸡鸣寺', '台城城墙', '德云社', '科巷', '狮子桥美食街', '湖南路', '评事街', 
    '三七八巷', '回味鸭血粉丝汤', '奇芳阁', '中山陵永丰诗舍', '南京大牌档', 
    '许阿姨糕团店', '陶记正宗德州扒鸡', '项记面馆', '小潘记·鸭血粉丝汤', 
    '金宏兴鸭子店', '小厨娘淮扬菜', '绿柳居', '左师傅梅花糕', '李记清真馆锅贴',
    '古南都·素菜馆', '鸡鸣汤包', '秦淮河', '紫金山', '台城', '新街口'
  ]
  
  // 检查是否包含已知的景点关键词
  for (const keyword of placeKeywords) {
    if (text.includes(keyword)) {
      places.push(keyword)
    }
  }
  
  // 如果没有找到特定地点，尝试提取括号中的地点名
  if (places.length === 0) {
    const bracketMatches = text.match(/【([^】]+)】/g)
    if (bracketMatches) {
      bracketMatches.forEach(match => {
        const place = match.replace(/【|】/g, '').trim()
        // 过滤掉一些通用描述
        const genericTerms = ['免费', '需预约', '特供', '必吃', '推荐', '建议', '人均', '老字号']
        let isGeneric = false
        for (const term of genericTerms) {
          if (place.includes(term)) {
            isGeneric = true
            break
          }
        }
        
        if (place && !places.includes(place) && !isGeneric) {
          places.push(place)
        }
      })
    }
  }
  
  // 如果仍然没有找到地点，使用原始提取方法
  if (places.length === 0) {
    const place = extractSinglePlaceName(text)
    if (place) {
      places.push(place)
    }
  }
  
  return places
}

/**
 * 从文本中提取单个景点名称
 * @param {string} text - 包含景点描述的文本
 * @returns {string} 提取的景点名称
 */
function extractSinglePlaceName(text) {
  if (!text) return ''
  
  // 常见的非景点关键词
  const nonPlaceKeywords = [
    '办理', '入住', '休息', '自由活动', '购物', '前往', '抵达', 
    '参观', '游览', '体验', '欣赏', '品尝', '早餐', '午餐', '晚餐',
    '上午', '中午', '下午', '晚上', '建议', '推荐', '必吃', '根据返程时间，可选购伴手礼'
  ]
  
  let cleanedText = text
  
  // 移除括号内的内容（通常是说明信息）
  cleanedText = cleanedText.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '')
  
  // 移除常见的非景点关键词及其后面的内容直到逗号或句号
  nonPlaceKeywords.forEach(keyword => {
    const regex = new RegExp(keyword + '[^,，.。]*[,，.。]?', 'g')
    cleanedText = cleanedText.replace(regex, '')
  })
  
  // 移除常见的非景点关键词（在末尾的情况）
  nonPlaceKeywords.forEach(keyword => {
    if (cleanedText.endsWith(keyword)) {
      cleanedText = cleanedText.substring(0, cleanedText.length - keyword.length)
    }
  })
  
  // 清理多余符号
  cleanedText = cleanedText.replace(/[、,，.。;；]$/, '').trim()
  
  // 如果清理后太短或包含特定词语，返回空
  if (cleanedText.length < 2 || cleanedText.includes('乘坐地铁')) {
    return ''
  }
  
  return cleanedText
}