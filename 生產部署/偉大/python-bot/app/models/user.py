"""
用戶和代理數據模型
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class User(Base):
    """用戶模型"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Telegram 信息
    telegram_id = Column(Integer, unique=True, nullable=False, index=True)
    username = Column(String(100), nullable=True, index=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    language_code = Column(String(10), default="zh-tw")
    
    # 用戶信息
    email = Column(String(200), nullable=True, index=True)
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # 餘額信息
    balance = Column(Float, default=0.0)  # USDT 餘額
    total_spent = Column(Float, default=0.0)  # 總消費
    total_orders = Column(Integer, default=0)  # 總訂單數
    
    # 代理信息
    is_agent = Column(Boolean, default=False)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_code = Column(String(20), unique=True, nullable=True, index=True)
    
    # 狀態
    status = Column(String(20), default="active")  # active, suspended, banned
    last_activity = Column(DateTime(timezone=True), nullable=True)
    
    # 時間戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 關聯
    referrer = relationship("User", remote_side=[id], backref="referrals")
    
    def __repr__(self):
        return f"<User(id={self.id}, telegram_id={self.telegram_id})>"

class Agent(Base):
    """代理模型"""
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # 代理等級
    level = Column(Integer, default=1)  # 1-5 等級
    commission_rate = Column(Float, default=0.05)  # 佣金比例
    
    # 業績統計
    total_sales = Column(Float, default=0.0)  # 總銷售額
    total_commission = Column(Float, default=0.0)  # 總佣金
    available_commission = Column(Float, default=0.0)  # 可提現佣金
    withdrawn_commission = Column(Float, default=0.0)  # 已提現佣金
    
    # 團隊統計
    team_size = Column(Integer, default=0)  # 團隊人數
    direct_referrals = Column(Integer, default=0)  # 直接推薦人數
    team_sales = Column(Float, default=0.0)  # 團隊銷售額
    
    # 狀態
    status = Column(String(20), default="active")  # active, suspended, terminated
    
    # 時間戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 關聯
    user = relationship("User", backref="agent_profile")
    
    def __repr__(self):
        return f"<Agent(id={self.id}, level={self.level}, sales={self.total_sales})>"

class AgentLevel(Base):
    """代理等級配置"""
    __tablename__ = "agent_levels"
    
    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, unique=True, nullable=False)
    name = Column(String(50), nullable=False)
    icon = Column(String(10), nullable=False)
    
    # 要求
    min_sales = Column(Float, nullable=False)  # 最低銷售額
    min_team_size = Column(Integer, nullable=False)  # 最低團隊人數
    
    # 權益
    commission_rate = Column(Float, nullable=False)  # 佣金比例
    team_bonus_rate = Column(Float, default=0.0)  # 團隊獎金比例
    
    # 描述
    description = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)  # JSON 格式的權益列表
    
    def __repr__(self):
        return f"<AgentLevel(level={self.level}, name={self.name})>"
