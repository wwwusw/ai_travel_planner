// 旅行计划服务封装
// import { generateTravelPlan } from './aliyunService' // 未使用的导入，已注释

let mockStreamIndex = 0;
const mockStreamData = [
  "1. 行程概览：\n",
  "   - 旅行主题：日本文化探索之旅\n",
  "   - 适合人群：家庭出行\n",
  "   - 行程亮点：东京现代文化、京都古典文化、大阪美食体验\n\n",
  "2. 详细行程安排：\n",
  "   - 第1天：抵达东京\n",
  "     - 上午：抵达东京成田/羽田机场，办理入境手续\n",
  "     - 中午：前往酒店办理入住，稍作休息\n",
  "     - 下午：浅草寺参观，体验传统日本文化\n",
  "     - 晚上：在隅田川游船，欣赏东京夜景\n\n",
  "   - 第2天：东京探索\n",
  "     - 上午：参观明治神宫，感受宁静的神社文化\n",
  "     - 中午：在原宿竹下通品尝特色小吃\n",
  "     - 下午：前往涩谷、新宿，体验现代都市氛围\n",
  "     - 晚上：品尝东京特色拉面\n\n",
  "   - 第3天：东京迪士尼\n",
  "     - 全天：东京迪士尼乐园或迪士尼海洋游玩\n",
  "     - 晚上：观看迪士尼烟花表演\n\n",
  "   - 第4天：前往京都\n",
  "     - 上午：乘坐新干线前往京都\n",
  "     - 中午：抵达京都，入住酒店\n",
  "     - 下午：参观伏见稻荷大社，千本鸟居\n",
  "     - 晚上：品尝京都怀石料理\n\n",
  "   - 第5天：京都文化体验\n",
  "     - 上午：参观金阁寺，欣赏日式庭园\n",
  "     - 中午：在锦市场品尝京都小吃\n",
  "     - 下午：参观清水寺，体验和服文化\n",
  "     - 晚上：返回东京\n\n",
  "3. 住宿推荐：\n",
  "   - 东京：新宿或银座区域的四星级酒店\n",
  "   - 京都：河原町区域的传统日式旅馆\n\n",
  "4. 餐饮推荐：\n",
  "   - 东京：寿司、拉面、天妇罗\n",
  "   - 京都：怀石料理、豆腐料理、抹茶甜品\n\n",
  "5. 预算分析：\n",
  "   - 交通费用：约3000元（含国际机票和新干线）\n",
  "   - 住宿费用：约4000元（5晚）\n",
  "   - 餐饮费用：约2000元\n",
  "   - 门票费用：约1500元（含迪士尼门票）\n",
  "   - 购物及其他：约2000元\n",
  "   - 总计：约12500元\n\n"
];

/**
 * 生成旅行计划（通过Vite代理调用阿里百炼平台API）
 * @param {Object} travelRequest - 旅行请求参数
 * @param {string} apiKey - 阿里百炼平台API密钥
 * @returns {Promise<ReadableStream>} - 流式响应
 */
export async function createTravelPlan(travelRequest, apiKey) {
  // 构建提示词 - 区分手动输入和语音输入
  let prompt;
  if (travelRequest.isVoiceInput) {
    // 语音输入模式 - 直接使用识别后的文本作为完整需求描述
    prompt = `你是一个专业的旅行规划师AI助手。请根据用户的语音输入内容为用户生成详细的旅行规划：
  
用户需求：${travelRequest.preferences}

请按照以下格式返回旅行规划：

1. 行程概览：
   - 旅行主题：
   - 适合人群：
   - 行程亮点：

2. 详细行程安排（按天）：
   - 第1天：
     - 上午：
     - 中午：
     - 下午：
     - 晚上：

3. 住宿推荐：
   - 推荐区域：
   - 酒店类型：

4. 餐饮推荐：
   - 特色美食：
   - 推荐餐厅：

5. 预算分析：
   - 交通费用：
   - 住宿费用：
   - 餐饮费用：
   - 门票费用：
   - 其他费用：
   - 总计：

请确保规划内容详细、实用且满足用户的需求。
请在最后单独换行并按照以下格式返回旅行规划中的所有旅游景点：

旅行路线：xxx->xxx->xxx->xxx`;
  } else {
    // 手动输入模式 - 使用结构化参数
    prompt = `你是一个专业的旅行规划师AI助手。请根据以下信息为用户生成详细的旅行规划：
  
目的地：${travelRequest.destination}
旅行天数：${travelRequest.duration}天
预算：${travelRequest.budget}元
同行人数：${travelRequest.companionsType === 'group' ? 
  travelRequest.companionsCount : 
  (travelRequest.companionsType === 'couple' ? 2 : 1)}人
旅行偏好：${travelRequest.preferences}

请按照以下格式返回旅行规划：

1. 行程概览：
   - 旅行主题：
   - 适合人群：
   - 行程亮点：

2. 详细行程安排（按天）：
   - 第1天：
     - 上午：
     - 中午：
     - 下午：
     - 晚上：

3. 住宿推荐：
   - 推荐区域：
   - 酒店类型：

4. 餐饮推荐：
   - 特色美食：
   - 推荐餐厅：

5. 预算分析：
   - 交通费用：
   - 住宿费用：
   - 餐饮费用：
   - 门票费用：
   - 其他费用：
   - 总计：

请确保规划内容详细、实用且符合用户预算。
请在最后单独换行并按照以下格式返回旅行规划中的所有旅游景点：

旅行路线：xxx->xxx->xxx->xxx`;
  }

  try {
    // 通过Vite代理调用阿里百炼平台API
    const response = await fetch('/api/dashscope/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-SSE': 'enable' // 启用流式输出
      },
      body: JSON.stringify({
        model: 'qwen3-max',
        input: {
          prompt: prompt
        },
        parameters: {
          max_tokens: 2000,
          temperature: 0.7,
          top_p: 0.8,
          incremental_output: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    return response.body;
  } catch (error) {
    console.error('调用阿里百炼平台API时出错:', error);
    // 出错时返回模拟数据流
    return createMockStream();
  }
}

/**
 * 创建模拟数据流
 * @returns {ReadableStream} - 模拟的流式响应
 */
function createMockStream() {
  return new ReadableStream({
    start(controller) {
      mockStreamIndex = 0;
    },
    
    async pull(controller) {
      if (mockStreamIndex < mockStreamData.length) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const chunk = mockStreamData[mockStreamIndex];
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(chunk));
        mockStreamIndex++;
      } else {
        controller.close();
      }
    },
    
    cancel() {
      // 流被取消时的处理
    }
  });
}

/**
 * 实际调用阿里百炼平台API（需要后端代理）
 * @param {Object} travelRequest - 旅行请求参数
 * @returns {Promise<ReadableStream>} - 流式响应
 */
export async function createTravelPlanWithProxy(travelRequest) {
  // 这里应该调用您自己的后端代理服务
  // 示例代码：
  /*
  const response = await fetch('/api/travel-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      destination: travelRequest.destination,
      duration: travelRequest.duration,
      budget: travelRequest.budget,
      companions: travelRequest.companionsType === 'group' ? 
        travelRequest.companionsCount : 
        (travelRequest.companionsType === 'couple' ? 2 : 1),
      preferences: travelRequest.preferences
    })
  });
  
  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }
  
  return response.body;
  */
  
  // 目前返回模拟数据
  return createMockStream();
}