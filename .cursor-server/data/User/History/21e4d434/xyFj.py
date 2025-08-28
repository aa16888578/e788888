"""
CVV 數據模型
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from datetime import datetime
from typing import Optional

Base = declarative_base()

class CVVStatus(str, PyEnum):
    ACTIVE = "active"
    SOLD = "sold"
    INVALID = "invalid"
    EXPIRED = "expired"

class CVVType(str, PyEnum):
    BASIC = "basic"
    PREMIUM = "premium"
    HOT = "hot"

class CVVCard(Base):
    """CVV 卡片模型"""
    __tablename__ = "cvv_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # 基本信息
    country_code = Column(String(3), nullable=False, index=True)  # AR, BR, DE 等
    country_name = Column(String(50), nullable=False)
    flag = Column(String(10), nullable=False)
    
    # 卡片信息 (加密存儲)
    card_number = Column(Text, nullable=False)  # 加密的卡號
    expiry_date = Column(String(7), nullable=False)  # MM/YYYY
    cvv_code = Column(String(10), nullable=False)  # 加密的 CVV
    cardholder_name = Column(Text, nullable=True)  # 加密的持卡人姓名
    
    # 銀行信息
    bank_name = Column(String(100), nullable=True)
    card_type = Column(String(20), nullable=True)  # visa, mastercard, amex
    card_level = Column(String(20), nullable=True)  # classic, gold, platinum
    
    # 地址信息 (加密存儲)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    zip_code = Column(String(20), nullable=True)
    phone = Column(Text, nullable=True)
    
    # 交易信息
    balance = Column(Float, default=0.0)  # 餘額 (美元)
    credit_limit = Column(Float, nullable=True)  # 信用額度
    
    # 商品信息
    price = Column(Float, nullable=False)  # 售價 (USDT)
    success_rate = Column(String(20), nullable=False)  # 成功率 "40%-70%"
    cvv_type = Column(Enum(CVVType), default=CVVType.BASIC)
    status = Column(Enum(CVVStatus), default=CVVStatus.ACTIVE)
    
    # 元數據
    batch_id = Column(String(50), nullable=True, index=True)  # 批次ID
    source = Column(String(50), nullable=True)  # 數據來源
    quality_score = Column(Float, default=0.0)  # 質量評分 0-100
    
    # 時間戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    sold_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<CVVCard(id={self.id}, country={self.country_code}, price={self.price})>"

class CVVBatch(Base):
    """CVV 批次模型"""
    __tablename__ = "cvv_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # 批次信息
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    total_count = Column(Integer, default=0)
    processed_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    
    # 導入信息
    import_format = Column(String(20), nullable=False)  # csv, txt, json
    import_file = Column(String(500), nullable=True)
    imported_by = Column(Integer, nullable=False)  # 用戶ID
    
    # 狀態
    status = Column(String(20), default="processing")  # processing, completed, failed
    
    # 時間戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<CVVBatch(id={self.batch_id}, count={self.total_count})>"

class CVVOrder(Base):
    """CVV 訂單模型"""
    __tablename__ = "cvv_orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    
    # 用戶信息
    user_id = Column(Integer, nullable=False, index=True)
    telegram_id = Column(Integer, nullable=False, index=True)
    
    # 訂單信息
    cvv_card_id = Column(Integer, nullable=False, index=True)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USDT")
    
    # 支付信息
    payment_method = Column(String(50), nullable=False)  # usdt_trc20, usdt_erc20
    payment_address = Column(String(100), nullable=True)
    payment_hash = Column(String(100), nullable=True)
    payment_amount = Column(Float, nullable=True)
    
    # 狀態
    order_status = Column(String(20), default="pending")  # pending, paid, delivered, cancelled
    payment_status = Column(String(20), default="pending")  # pending, confirmed, failed
    
    # 代理信息
    agent_id = Column(Integer, nullable=True, index=True)
    commission_rate = Column(Float, default=0.0)
    commission_amount = Column(Float, default=0.0)
    
    # 時間戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    paid_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<CVVOrder(id={self.order_number}, amount={self.total_amount})>"
