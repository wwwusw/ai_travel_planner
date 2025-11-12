<template>
  <div class="map-container">
    <div ref="mapContainer" class="amap-container" :id="mapId"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'

// 定义组件属性
const props = defineProps({
  center: {
    type: Array,
    default: () => [116.397428, 39.90923] // 默认北京天安门
  },
  zoom: {
    type: Number,
    default: 12 // 默认中国视图缩放级别
  },
  destination: {
    type: String,
    default: ''
  },
  // 新增行程数据属性
  itinerary: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits(['map-loaded', 'destination-updated'])

// 响应式数据
const mapContainer = ref(null)
const map = ref(null)
const geocoder = ref(null)
const marker = ref(null)
const mapId = ref('amap-container-' + Date.now())

let AMapInstance = null
let isMapDestroyed = false
let driving = null // 路线规划对象
let polyline = null // 路线连线

// 初始化地图
const initMap = async () => {
  try {
    // 检查是否已经销毁
    if (isMapDestroyed) {
      console.warn('地图组件已被销毁，取消初始化')
      return
    }

    // 检查API Key是否存在
    const apiKey = import.meta.env.VITE_AMAP_API_KEY
    if (!apiKey) {
      console.error('高德地图API Key未配置，请在.env文件中设置VITE_AMAP_API_KEY')
      return
    }

    // 配置安全密钥（如果需要）
    if (import.meta.env.VITE_AMAP_SECURITY_CODE) {
      window._AMapSecurityConfig = {
        securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE
      }
    }

    // 加载高德地图API，添加路线规划插件
    AMapInstance = await AMapLoader.load({
      key: apiKey, // 申请好的Web端开发者Key
      version: "1.4.15", // 指定要加载的 JSAPI 的版本
      plugins: ['AMap.Geocoder', 'AMap.Scale', 'AMap.ToolBar', 'AMap.Driving'] // 添加路线规划插件
    })

    // 确保DOM已更新
    await nextTick()
    
    // 检查容器元素是否存在
    if (!mapContainer.value) {
      console.error('地图容器元素未找到')
      return
    }

    // 检查是否已经销毁
    if (isMapDestroyed) {
      console.warn('地图组件已被销毁，取消初始化')
      return
    }

    // 创建地图实例
    map.value = new AMapInstance.Map(mapId.value, {
      zoom: props.zoom,
      center: props.center,
      mapStyle: 'amap://styles/normal',
      viewMode: '2D', // 使用2D视图模式
      zooms: [2, 18], // 设置缩放级别范围
      dragEnable: true,
      zoomEnable: true,
      doubleClickZoom: true
    })

    // 监听地图加载完成事件
    map.value.on('complete', () => {
      // 添加地图控件
      try {
        if (AMapInstance && AMapInstance.Scale) {
          const scale = new AMapInstance.Scale({position: 'LB'})
          map.value.addControl(scale)
        }
        if (AMapInstance && AMapInstance.ToolBar) {
          const toolbar = new AMapInstance.ToolBar({position: 'LT'})
          map.value.addControl(toolbar)
        }
      } catch (controlError) {
        console.warn('添加地图控件时出错:', controlError)
      }

      // 初始化地理编码服务
      if (AMapInstance && AMapInstance.Geocoder) {
        geocoder.value = new AMapInstance.Geocoder({
          city: '全国',
          radius: 1000
        })
      }

      // 初始化路线规划服务
      if (AMapInstance && AMapInstance.Driving) {
        driving = new AMapInstance.Driving({
          map: map.value,
          panel: null // 不显示路线面板
        })
        
        // 监听路线规划完成事件
        driving.on('complete', function(result) {
          console.log('路线规划完成:', result);
        });
        
        // 监听路线规划错误事件
        driving.on('error', function(error) {
          console.error('路线规划出错:', error);
        });
      }

      // 添加初始标记（如果是默认位置）
      if (props.center && props.center.length === 2) {
        addMarker(props.center, props.destination || '北京天安门')
      }

      // 通知父组件地图已加载完成
      emit('map-loaded', map.value)
      
      console.log('高德地图初始化完成')
    })

  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

// 添加标记
const addMarker = (position, title) => {
  // 检查是否已经销毁
  if (isMapDestroyed) {
    console.warn('地图组件已被销毁，取消添加标记')
    return
  }

  // 检查地图和API实例是否存在
  if (!map.value || !AMapInstance) {
    console.warn('地图或API实例未初始化')
    return
  }

  // 清除现有标记
  if (marker.value) {
    try {
      map.value.remove(marker.value)
    } catch (removeError) {
      console.warn('移除旧标记时出错:', removeError)
    }
    marker.value = null
  }
  
  // 添加新标记
  try {
    marker.value = new AMapInstance.Marker({
      position: position,
      title: title
    })
    
    marker.value.setMap(map.value)
    
    // 添加信息窗口
    const infoWindow = new AMapInstance.InfoWindow({
      content: `<div style="padding: 5px;">${title}</div>`,
      offset: AMapInstance.Pixel ? new AMapInstance.Pixel(0, -20) : undefined
    })
    
    infoWindow.open(map.value, position)
  } catch (markerError) {
    console.error('添加标记时出错:', markerError)
  }
}

// 安全地设置地图缩放级别
const setMapZoom = (zoomLevel) => {
  // 检查地图实例是否存在且未被销毁
  if (!map.value || isMapDestroyed) {
    console.warn('地图实例不存在或已被销毁，无法设置缩放级别')
    return
  }
  
  try {
    map.value.setZoom(zoomLevel)
  } catch (error) {
    console.error('设置地图缩放级别时出错:', error)
  }
}

// 安全地设置地图中心点
const setMapCenter = (center) => {
  // 检查地图实例是否存在且未被销毁
  if (!map.value || isMapDestroyed) {
    console.warn('地图实例不存在或已被销毁，无法设置中心点')
    return
  }
  
  try {
    map.value.setCenter(center)
  } catch (error) {
    console.error('设置地图中心点时出错:', error)
  }
}

// 更新地图到指定目的地
const updateDestination = (destination) => {
  // 检查是否已经销毁
  if (isMapDestroyed) {
    console.warn('地图组件已被销毁，取消更新目的地')
    return
  }

  // 检查必要组件是否存在
  if (!map.value || !geocoder.value || !destination) {
    console.warn('地图、地理编码服务未初始化或目的地为空')
    return
  }

  try {
    geocoder.value.getLocation(destination, (status, result) => {
      // 再次检查是否已经销毁
      if (isMapDestroyed) {
        console.warn('地图组件已被销毁，取消处理地理编码结果')
        return
      }

      if (status === 'complete' && result.geocodes.length) {
        const geocode = result.geocodes[0]
        const location = geocode.location
        
        // 设置地图中心点
        try {
          // 检查地图实例是否存在且未被销毁
          if (!map.value || isMapDestroyed) {
            console.warn('地图实例不存在或已被销毁，无法设置中心点和缩放级别')
            return
          }
          
          map.value.setCenter([location.lng, location.lat])
          map.value.setZoom(10)
          
          // 添加标记
          addMarker([location.lng, location.lat], destination)
          
          // 通知父组件目的地已更新
          emit('destination-updated', {
            destination: destination,
            location: location
          })
        } catch (mapError) {
          console.error('更新地图时出错:', mapError)
        }
      } else {
        console.error('无法获取目的地坐标:', status, result)
      }
    })
  } catch (geoError) {
    console.error('调用地理编码服务时出错:', geoError)
  }
}

// 解析行程数据并在地图上显示
const displayItinerary = async (itineraryData) => {
  if (!map.value || !driving || !itineraryData || itineraryData.length === 0) {
    console.warn('地图或路线规划服务未初始化，或行程数据为空')
    return
  }

  try {
    // 清除之前的路线
    if (driving) {
      driving.clear()
    }

    // 处理行程数据（现在只包含地点的数组）
    let placesToProcess = [];
    
    // itineraryData 应该是一个地点数组
    if (Array.isArray(itineraryData) && itineraryData.length > 0) {
      placesToProcess = [...itineraryData];
    }
    console.log('处理行程数据:', placesToProcess);
    // 构造路径规划参数
    const points = placesToProcess.map((place, index) => {
      return {
        keyword: place,
        city: props.destination || '全国'
      }
    });
    
    // 如果有至少两个点，则规划路线
    if (points.length >= 2) {
      // 使用高德地图API进行路径规划
      // 根据高德地图API文档，points应该包含所有点（起点、终点和途经点）
      console.log('路径规划参数:', points);
      driving.search(points, (status, result) => {
        if (status === 'complete') {
          console.log('路线规划成功:', result);
        } else {
          console.error('路线规划失败:', status, result);
        }
      });
    } else if (points.length === 1) {
      // 只有一个点，居中显示
      console.warn('路径规划需要至少两个点，当前只有一个点:', points[0]);
    }
  } catch (error) {
    console.error('路径规划时出错:', error)
  }
}

// 清除路线
const clearItinerary = () => {
  // 清除路线
  if (driving) {
    driving.clear()
  }
  
  // 清除自定义路线
  if (polyline) {
    try {
      polyline.setMap(null)
    } catch (e) {
      console.warn('移除路线时出错:', e)
    }
    polyline = null
  }
}

// 监听目的地变化
watch(() => props.destination, (newDestination) => {
  if (newDestination && !isMapDestroyed) {
    updateDestination(newDestination)
  }
})

// 监听行程数据变化
watch(() => props.itinerary, (newItinerary) => {
  if (newItinerary && newItinerary.length > 0 && !isMapDestroyed) {
    displayItinerary(newItinerary)
  }
})

// 监听中心点变化
watch(() => props.center, (newCenter) => {
  // 检查地图实例是否存在且未被销毁
  if (!map.value || isMapDestroyed) {
    console.warn('地图实例不存在或已被销毁，无法设置中心点')
    return
  }
  
  if (newCenter && newCenter.length === 2) {
    try {
      map.value.setCenter(newCenter)
    } catch (error) {
      console.error('设置地图中心点时出错:', error)
    }
  }
})

// 组件挂载时初始化地图
onMounted(() => {
  // 确保在DOM完全加载后再初始化地图
  nextTick(() => {
    initMap()
  })
})

// 组件卸载前清理
onUnmounted(() => {
  isMapDestroyed = true
  
  // 清除行程
  clearItinerary()
  
  if (marker.value) {
    try {
      marker.value.setMap(null)
    } catch (error) {
      console.warn('清理标记时出错:', error)
    }
    marker.value = null
  }
  
  if (map.value) {
    try {
      map.value.destroy()
    } catch (error) {
      console.error('销毁地图时出错:', error)
    }
    map.value = null
  }
  
  geocoder.value = null
  AMapInstance = null
  driving = null
})

// 提供给父组件的方法
defineExpose({
  updateDestination,
  setMapZoom,
  setMapCenter,
  displayItinerary,
  clearItinerary
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

.amap-container {
  width: 100%;
  height: 100%;
}
</style>