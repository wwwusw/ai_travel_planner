# AI旅行规划师数据库设计文档

## 1. 概述

AI旅行规划师数据库设计旨在支持应用程序的核心功能，包括用户管理、旅行计划生成、预算管理、支出跟踪等。数据库采用关系型设计，遵循第三范式，确保数据一致性和完整性。

## 2. 设计原则

1. **命名规范**：表名使用复数形式，字段名使用下划线分隔的小写形式
2. **数据类型优化**：根据实际需求选择最合适的数据类型以节省存储空间
3. **索引策略**：为常用查询字段添加索引以提高查询性能
4. **外键约束**：使用外键维护数据完整性
5. **时间戳字段**：每个表都包含创建时间和更新时间字段
6. **软删除**：使用状态字段而非物理删除记录

## 3. 表结构详解

### 3.1 用户表 (users)

存储用户基本信息和认证数据。

| 字段名 | 数据类型 | 允许空 | 默认值 | 描述 |
|--------|---------|--------|--------|------|
| id | INT | 否 | AUTO_INCREMENT | 用户ID，主键 |
| username | VARCHAR(50) | 否 | 无 | 用户名，唯一 |
| email | VARCHAR(100) | 否 | 无 | 邮箱，唯一 |
| password_hash | VARCHAR(255) | 否 | 无 | 密码哈希值 |
| nickname | VARCHAR(50) | 是 | NULL | 昵称 |
| avatar_url | VARCHAR(255) | 是 | NULL | 头像URL |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |
| last_login | TIMESTAMP | 是 | NULL | 最后登录时间 |
| is_active | TINYINT(1) | 否 | 1 | 是否激活 |

### 3.2 旅行计划表 (travel_plans)

存储用户创建的旅行计划概要信息。

| 字段名 | 数据类型 | 允许空 | 默认值 | 描述 |
|--------|---------|--------|--------|------|
| id | INT | 否 | AUTO_INCREMENT | 旅行计划ID，主键 |
| user_id | INT | 否 | 无 | 用户ID，外键关联users表 |
| title | VARCHAR(100) | 否 | 无 | 计划标题 |
| destination | VARCHAR(100) | 否 | 无 | 目的地 |
| start_date | DATE | 否 | 无 | 开始日期 |
| end_date | DATE | 否 | 无 | 结束日期 |
| duration | INT | 否 | 无 | 旅行天数 |
| budget | DECIMAL(10,2) | 否 | 0.00 | 预算 |
| companions | ENUM | 否 | 'alone' | 同行人员类型 |
| preferences | TEXT | 是 | NULL | 旅行偏好 |
| plan_details | JSON | 是 | NULL | 详细计划(JSON格式) |
| status | ENUM | 否 | 'draft' | 计划状态 |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

### 3.3 行程明细表 (itinerary_items)

存储旅行计划中每天的具体行程安排。

| 字段名 | 数据类型 | 允许空 | 默认值 | 描述 |
|--------|---------|--------|--------|------|
| id | INT | 否 | AUTO_INCREMENT | 行程项ID，主键 |
| plan_id | INT | 否 | 无 | 计划ID，外键关联travel_plans表 |
| day_number | INT | 否 | 无 | 第几天 |
| title | VARCHAR(100) | 否 | 无 | 项目标题 |
| description | TEXT | 是 | NULL | 项目描述 |
| start_time | TIME | 是 | NULL | 开始时间 |
| end_time | TIME | 是 | NULL | 结束时间 |
| location | VARCHAR(255) | 是 | NULL | 地点 |
| latitude | DECIMAL(10, 8) | 是 | NULL | 纬度 |
| longitude | DECIMAL(11, 8) | 是 | NULL | 经度 |
| category | ENUM | 否 | 'other' | 类别 |
| cost | DECIMAL(10,2) | 否 | 0.00 | 费用 |
| notes | TEXT | 是 | NULL | 备注 |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

### 3.4 预算项目表 (budget_items)

存储旅行计划的预算分配信息。

| 字段名 | 数据类型 | 允许空 | 默认值 | 描述 |
|--------|---------|--------|--------|------|
| id | INT | 否 | AUTO_INCREMENT | 预算项ID，主键 |
| plan_id | INT | 否 | 无 | 计划ID，外键关联travel_plans表 |
| category | VARCHAR(50) | 否 | 无 | 预算类别 |
| allocated_amount | DECIMAL(10,2) | 否 | 0.00 | 分配金额 |
| spent_amount | DECIMAL(10,2) | 否 | 0.00 | 已花费金额 |
| currency | VARCHAR(3) | 否 | 'CNY' | 货币单位 |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

### 3.5 实际支出记录表 (expense_records)

存储旅行过程中的实际支出记录。

| 字段名 | 数据类型 | 允许空 | 默认值 | 描述 |
|--------|---------|--------|--------|------|
| id | INT | 否 | AUTO_INCREMENT | 支出记录ID，主键 |
| plan_id | INT | 否 | 无 | 计划ID，外键关联travel_plans表 |
| item_id | INT | 是 | NULL | 行程项ID，外键关联itinerary_items表 |
| budget_item_id | INT | 是 | NULL | 预算项ID，外键关联budget_items表 |
| amount | DECIMAL(10,2) | 否 | 0.00 | 金额 |
| currency | VARCHAR(3) | 否 | 'CNY' | 货币单位 |
| category | VARCHAR(50) | 否 | 无 | 支出类别 |
| description | VARCHAR(255) | 是 | NULL | 描述 |
| expense_date | DATE | 否 | 无 | 支出日期 |
| payment_method | ENUM | 否 | 'cash' | 支付方式 |
| receipt_image_url | VARCHAR(255) | 是 | NULL | 收据图片URL |
| notes | TEXT | 是 | NULL | 备注 |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

### 3.6 用户偏好设置表 (user_preferences)

存储用户的个性化偏好设置。

| 字段名 | 数据类型 | 允许空 | 默认值 | 描述 |
|--------|---------|--------|--------|------|
| id | INT | 否 | AUTO_INCREMENT | 偏好设置ID，主键 |
| user_id | INT | 否 | 无 | 用户ID，外键关联users表 |
| preference_key | VARCHAR(50) | 否 | 无 | 偏好键名 |
| preference_value | TEXT | 是 | NULL | 偏好值 |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

### 3.7 目的地信息表 (destinations)

存储旅行目的地的基础信息。

| 字段名 | 数据类型 | 允许空 | 默认值 | 描述 |
|--------|---------|--------|--------|------|
| id | INT | 否 | AUTO_INCREMENT | 目的地ID，主键 |
| name | VARCHAR(100) | 否 | 无 | 名称 |
| country | VARCHAR(50) | 是 | NULL | 国家 |
| description | TEXT | 是 | NULL | 描述 |
| latitude | DECIMAL(10, 8) | 是 | NULL | 纬度 |
| longitude | DECIMAL(11, 8) | 是 | NULL | 经度 |
| timezone | VARCHAR(50) | 是 | NULL | 时区 |
| currency | VARCHAR(3) | 否 | 'CNY' | 当地货币 |
| language | VARCHAR(30) | 是 | NULL | 官方语言 |
| visa_required | TINYINT(1) | 否 | 0 | 是否需要签证 |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

### 3.8 目的地景点表 (attractions)

存储目的地的景点信息。

| 字段名 | 数据类型 | 允许空 | 默认值 | 描述 |
|--------|---------|--------|--------|------|
| id | INT | 否 | AUTO_INCREMENT | 景点ID，主键 |
| destination_id | INT | 否 | 无 | 目的地ID，外键关联destinations表 |
| name | VARCHAR(100) | 否 | 无 | 名称 |
| description | TEXT | 是 | NULL | 描述 |
| address | TEXT | 是 | NULL | 地址 |
| latitude | DECIMAL(10, 8) | 是 | NULL | 纬度 |
| longitude | DECIMAL(11, 8) | 是 | NULL | 经度 |
| category | VARCHAR(50) | 是 | NULL | 类别 |
| opening_hours | VARCHAR(100) | 是 | NULL | 开放时间 |
| ticket_price | DECIMAL(10,2) | 是 | NULL | 门票价格 |
| rating | DECIMAL(2,1) | 是 | NULL | 评分 |
| website | VARCHAR(255) | 是 | NULL | 网站 |
| phone | VARCHAR(20) | 是 | NULL | 电话 |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

### 3.9 酒店信息表 (hotels)

存储目的地的酒店信息。

| 字段名 | 数据类型 | 允许空 | 默认值 | 描述 |
|--------|---------|--------|--------|------|
| id | INT | 否 | AUTO_INCREMENT | 酒店ID，主键 |
| destination_id | INT | 否 | 无 | 目的地ID，外键关联destinations表 |
| name | VARCHAR(100) | 否 | 无 | 名称 |
| description | TEXT | 是 | NULL | 描述 |
| address | TEXT | 是 | NULL | 地址 |
| latitude | DECIMAL(10, 8) | 是 | NULL | 纬度 |
| longitude | DECIMAL(11, 8) | 是 | NULL | 经度 |
| star_rating | TINYINT | 是 | NULL | 星级 |
| price_per_night | DECIMAL(10,2) | 是 | NULL | 每晚价格 |
| amenities | TEXT | 是 | NULL | 设施(逗号分隔) |
| rating | DECIMAL(2,1) | 是 | NULL | 评分 |
| website | VARCHAR(255) | 是 | NULL | 网站 |
| phone | VARCHAR(20) | 是 | NULL | 电话 |
| checkin_time | TIME | 否 | '14:00:00' | 入住时间 |
| checkout_time | TIME | 否 | '12:00:00' | 退房时间 |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

### 3.10 餐厅信息表 (restaurants)

存储目的地的餐厅信息。

| 字段名 | 数据类型 | 允许空 | 默认值 | 描述 |
|--------|---------|--------|--------|------|
| id | INT | 否 | AUTO_INCREMENT | 餐厅ID，主键 |
| destination_id | INT | 否 | 无 | 目的地ID，外键关联destinations表 |
| name | VARCHAR(100) | 否 | 无 | 名称 |
| description | TEXT | 是 | NULL | 描述 |
| address | TEXT | 是 | NULL | 地址 |
| latitude | DECIMAL(10, 8) | 是 | NULL | 纬度 |
| longitude | DECIMAL(11, 8) | 是 | NULL | 经度 |
| cuisine_type | VARCHAR(50) | 是 | NULL | 菜系类型 |
| average_price | DECIMAL(10,2) | 是 | NULL | 人均消费 |
| rating | DECIMAL(2,1) | 是 | NULL | 评分 |
| opening_hours | VARCHAR(100) | 是 | NULL | 营业时间 |
| website | VARCHAR(255) | 是 | NULL | 网站 |
| phone | VARCHAR(20) | 是 | NULL | 电话 |
| created_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 否 | CURRENT_TIMESTAMP ON UPDATE | 更新时间 |

## 4. 索引策略

为提高查询性能，我们在以下字段上创建了索引：

1. **users表**：
   - email字段（唯一索引）
   - username字段（唯一索引）

2. **travel_plans表**：
   - user_id字段（普通索引）
   - status字段（普通索引）
   - destination字段（普通索引）

3. **itinerary_items表**：
   - plan_id字段（普通索引）
   - day_number字段（普通索引）
   - category字段（普通索引）

4. **budget_items表**：
   - plan_id字段（普通索引）
   - category字段（普通索引）

5. **expense_records表**：
   - plan_id字段（普通索引）
   - expense_date字段（普通索引）
   - category字段（普通索引）

6. **user_preferences表**：
   - user_id字段（普通索引）
   - user_id和preference_key的组合唯一索引

7. **destinations表**：
   - name字段（普通索引）
   - country字段（普通索引）

8. **attractions表**：
   - destination_id字段（普通索引）
   - category字段（普通索引）
   - name字段（普通索引）

9. **hotels表**：
   - destination_id字段（普通索引）
   - rating字段（普通索引）
   - price_per_night字段（普通索引）

10. **restaurants表**：
    - destination_id字段（普通索引）
    - cuisine_type字段（普通索引）
    - rating字段（普通索引）

## 5. 外键关系

1. **travel_plans.user_id** → **users.id**
2. **itinerary_items.plan_id** → **travel_plans.id**
3. **budget_items.plan_id** → **travel_plans.id**
4. **expense_records.plan_id** → **travel_plans.id**
5. **expense_records.item_id** → **itinerary_items.id**
6. **expense_records.budget_item_id** → **budget_items.id**
7. **user_preferences.user_id** → **users.id**
8. **attractions.destination_id** → **destinations.id**
9. **hotels.destination_id** → **destinations.id**
10. **restaurants.destination_id** → **destinations.id**

## 6. 数据库使用说明

1. 所有表都包含created_at和updated_at字段，用于记录数据的创建和更新时间
2. 使用ENUM类型限制字段的取值范围，确保数据一致性
3. 使用DECIMAL类型存储金额，避免浮点数精度问题
4. 使用JSON类型存储复杂的计划详情，提供灵活性
5. 通过外键约束维护数据完整性
6. 为常用查询字段添加索引，提高查询性能