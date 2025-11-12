-- AI旅行规划师数据库表结构设计

-- 1. 用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希值',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar_url VARCHAR(255) COMMENT '头像URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_login TIMESTAMP NULL COMMENT '最后登录时间',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否激活'
) COMMENT '用户表';

-- 添加索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 2. 旅行计划表
CREATE TABLE travel_plans (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '旅行计划ID',
    user_id INT NOT NULL COMMENT '用户ID',
    title VARCHAR(100) NOT NULL COMMENT '计划标题',
    destination VARCHAR(100) NOT NULL COMMENT '目的地',
    start_date DATE NOT NULL COMMENT '开始日期',
    end_date DATE NOT NULL COMMENT '结束日期',
    duration INT NOT NULL COMMENT '旅行天数',
    budget DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '预算',
    companions ENUM('alone', 'couple', 'family', 'friends') NOT NULL DEFAULT 'alone' COMMENT '同行人员',
    preferences TEXT COMMENT '旅行偏好',
    plan_details JSON COMMENT '详细计划(JSON格式)',
    status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'draft' COMMENT '计划状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) COMMENT '旅行计划表';

-- 添加索引
CREATE INDEX idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX idx_travel_plans_status ON travel_plans(status);
CREATE INDEX idx_travel_plans_destination ON travel_plans(destination);

-- 3. 行程明细表
CREATE TABLE itinerary_items (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '行程项ID',
    plan_id INT NOT NULL COMMENT '计划ID',
    day_number INT NOT NULL COMMENT '第几天',
    title VARCHAR(100) NOT NULL COMMENT '项目标题',
    description TEXT COMMENT '项目描述',
    start_time TIME COMMENT '开始时间',
    end_time TIME COMMENT '结束时间',
    location VARCHAR(255) COMMENT '地点',
    latitude DECIMAL(10, 8) COMMENT '纬度',
    longitude DECIMAL(11, 8) COMMENT '经度',
    category ENUM('attraction', 'accommodation', 'restaurant', 'transport', 'activity', 'other') NOT NULL DEFAULT 'other' COMMENT '类别',
    cost DECIMAL(10,2) DEFAULT 0.00 COMMENT '费用',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (plan_id) REFERENCES travel_plans(id) ON DELETE CASCADE
) COMMENT '行程明细表';

-- 添加索引
CREATE INDEX idx_itinerary_items_plan_id ON itinerary_items(plan_id);
CREATE INDEX idx_itinerary_items_day ON itinerary_items(day_number);
CREATE INDEX idx_itinerary_items_category ON itinerary_items(category);

-- 4. 预算项目表
CREATE TABLE budget_items (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '预算项ID',
    plan_id INT NOT NULL COMMENT '计划ID',
    category VARCHAR(50) NOT NULL COMMENT '预算类别',
    allocated_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '分配金额',
    spent_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '已花费金额',
    currency VARCHAR(3) DEFAULT 'CNY' COMMENT '货币单位',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (plan_id) REFERENCES travel_plans(id) ON DELETE CASCADE
) COMMENT '预算项目表';

-- 添加索引
CREATE INDEX idx_budget_items_plan_id ON budget_items(plan_id);
CREATE INDEX idx_budget_items_category ON budget_items(category);

-- 5. 实际支出记录表
CREATE TABLE expense_records (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '支出记录ID',
    plan_id INT NOT NULL COMMENT '计划ID',
    item_id INT COMMENT '行程项ID（关联具体行程）',
    budget_item_id INT COMMENT '预算项ID',
    amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '金额',
    currency VARCHAR(3) DEFAULT 'CNY' COMMENT '货币单位',
    category VARCHAR(50) NOT NULL COMMENT '支出类别',
    description VARCHAR(255) COMMENT '描述',
    expense_date DATE NOT NULL COMMENT '支出日期',
    payment_method ENUM('cash', 'credit_card', 'debit_card', 'mobile_payment', 'other') DEFAULT 'cash' COMMENT '支付方式',
    receipt_image_url VARCHAR(255) COMMENT '收据图片URL',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (plan_id) REFERENCES travel_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES itinerary_items(id) ON DELETE SET NULL,
    FOREIGN KEY (budget_item_id) REFERENCES budget_items(id) ON DELETE SET NULL
) COMMENT '实际支出记录表';

-- 添加索引
CREATE INDEX idx_expense_records_plan_id ON expense_records(plan_id);
CREATE INDEX idx_expense_records_date ON expense_records(expense_date);
CREATE INDEX idx_expense_records_category ON expense_records(category);

-- 6. 用户偏好设置表
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '偏好设置ID',
    user_id INT NOT NULL COMMENT '用户ID',
    preference_key VARCHAR(50) NOT NULL COMMENT '偏好键名',
    preference_value TEXT COMMENT '偏好值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_preference (user_id, preference_key)
) COMMENT '用户偏好设置表';

-- 添加索引
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- 7. 目的地信息表
CREATE TABLE destinations (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '目的地ID',
    name VARCHAR(100) NOT NULL COMMENT '名称',
    country VARCHAR(50) COMMENT '国家',
    description TEXT COMMENT '描述',
    latitude DECIMAL(10, 8) COMMENT '纬度',
    longitude DECIMAL(11, 8) COMMENT '经度',
    timezone VARCHAR(50) COMMENT '时区',
    currency VARCHAR(3) DEFAULT 'CNY' COMMENT '当地货币',
    language VARCHAR(30) COMMENT '官方语言',
    visa_required TINYINT(1) DEFAULT 0 COMMENT '是否需要签证',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '目的地信息表';

-- 添加索引
CREATE INDEX idx_destinations_name ON destinations(name);
CREATE INDEX idx_destinations_country ON destinations(country);

-- 8. 目的地景点表
CREATE TABLE attractions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '景点ID',
    destination_id INT NOT NULL COMMENT '目的地ID',
    name VARCHAR(100) NOT NULL COMMENT '名称',
    description TEXT COMMENT '描述',
    address TEXT COMMENT '地址',
    latitude DECIMAL(10, 8) COMMENT '纬度',
    longitude DECIMAL(11, 8) COMMENT '经度',
    category VARCHAR(50) COMMENT '类别',
    opening_hours VARCHAR(100) COMMENT '开放时间',
    ticket_price DECIMAL(10,2) COMMENT '门票价格',
    rating DECIMAL(2,1) COMMENT '评分',
    website VARCHAR(255) COMMENT '网站',
    phone VARCHAR(20) COMMENT '电话',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) COMMENT '目的地景点表';

-- 添加索引
CREATE INDEX idx_attractions_destination_id ON attractions(destination_id);
CREATE INDEX idx_attractions_category ON attractions(category);
CREATE INDEX idx_attractions_name ON attractions(name);

-- 9. 酒店信息表
CREATE TABLE hotels (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '酒店ID',
    destination_id INT NOT NULL COMMENT '目的地ID',
    name VARCHAR(100) NOT NULL COMMENT '名称',
    description TEXT COMMENT '描述',
    address TEXT COMMENT '地址',
    latitude DECIMAL(10, 8) COMMENT '纬度',
    longitude DECIMAL(11, 8) COMMENT '经度',
    star_rating TINYINT COMMENT '星级',
    price_per_night DECIMAL(10,2) COMMENT '每晚价格',
    amenities TEXT COMMENT '设施(逗号分隔)',
    rating DECIMAL(2,1) COMMENT '评分',
    website VARCHAR(255) COMMENT '网站',
    phone VARCHAR(20) COMMENT '电话',
    checkin_time TIME DEFAULT '14:00:00' COMMENT '入住时间',
    checkout_time TIME DEFAULT '12:00:00' COMMENT '退房时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) COMMENT '酒店信息表';

-- 添加索引
CREATE INDEX idx_hotels_destination_id ON hotels(destination_id);
CREATE INDEX idx_hotels_rating ON hotels(rating);
CREATE INDEX idx_hotels_price ON hotels(price_per_night);

-- 10. 餐厅信息表
CREATE TABLE restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '餐厅ID',
    destination_id INT NOT NULL COMMENT '目的地ID',
    name VARCHAR(100) NOT NULL COMMENT '名称',
    description TEXT COMMENT '描述',
    address TEXT COMMENT '地址',
    latitude DECIMAL(10, 8) COMMENT '纬度',
    longitude DECIMAL(11, 8) COMMENT '经度',
    cuisine_type VARCHAR(50) COMMENT '菜系类型',
    average_price DECIMAL(10,2) COMMENT '人均消费',
    rating DECIMAL(2,1) COMMENT '评分',
    opening_hours VARCHAR(100) COMMENT '营业时间',
    website VARCHAR(255) COMMENT '网站',
    phone VARCHAR(20) COMMENT '电话',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) COMMENT '餐厅信息表';

-- 添加索引
CREATE INDEX idx_restaurants_destination_id ON restaurants(destination_id);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_rating ON restaurants(rating);