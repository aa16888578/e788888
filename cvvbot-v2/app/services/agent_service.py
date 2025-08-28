"""
代理商權限系統服務
管理代理商等級、權限、佣金計算等
"""
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from enum import Enum

from ..services.firebase_service import firebase_service
from ..core.config import settings

logger = logging.getLogger(__name__)

class AgentLevel(Enum):
    """代理商等級枚舉"""
    BRONZE = 1      # 銅牌代理
    SILVER = 2      # 銀牌代理  
    GOLD = 3        # 金牌代理
    PLATINUM = 4    # 鉑金代理
    DIAMOND = 5     # 鑽石代理

class AgentStatus(Enum):
    """代理商狀態枚舉"""
    PENDING = "pending"         # 待審核
    ACTIVE = "active"          # 活躍
    SUSPENDED = "suspended"    # 暫停
    TERMINATED = "terminated"  # 終止

class AgentService:
    """代理商服務類"""
    
    def __init__(self):
        self.level_config = {
            AgentLevel.BRONZE: {
                "name": "銅牌代理",
                "icon": "🥉",
                "commission_rate": 0.05,    # 5%
                "min_sales": 0,             # 最低銷售額
                "min_team_size": 0,         # 最低團隊人數
                "monthly_bonus": 0,         # 月度獎金
                "upgrade_requirements": {
                    "sales": 1000,          # 升級需要銷售額
                    "team_size": 3,         # 升級需要團隊人數
                    "active_days": 30       # 活躍天數
                }
            },
            AgentLevel.SILVER: {
                "name": "銀牌代理",
                "icon": "🥈",
                "commission_rate": 0.08,    # 8%
                "min_sales": 1000,
                "min_team_size": 3,
                "monthly_bonus": 50,
                "upgrade_requirements": {
                    "sales": 5000,
                    "team_size": 10,
                    "active_days": 60
                }
            },
            AgentLevel.GOLD: {
                "name": "金牌代理",
                "icon": "🥇",
                "commission_rate": 0.12,    # 12%
                "min_sales": 5000,
                "min_team_size": 10,
                "monthly_bonus": 200,
                "upgrade_requirements": {
                    "sales": 20000,
                    "team_size": 30,
                    "active_days": 90
                }
            },
            AgentLevel.PLATINUM: {
                "name": "鉑金代理",
                "icon": "💎",
                "commission_rate": 0.15,    # 15%
                "min_sales": 20000,
                "min_team_size": 30,
                "monthly_bonus": 500,
                "upgrade_requirements": {
                    "sales": 50000,
                    "team_size": 100,
                    "active_days": 120
                }
            },
            AgentLevel.DIAMOND: {
                "name": "鑽石代理",
                "icon": "💎✨",
                "commission_rate": 0.18,    # 18%
                "min_sales": 50000,
                "min_team_size": 100,
                "monthly_bonus": 1000,
                "upgrade_requirements": None  # 最高等級
            }
        }
    
    async def create_agent(self, user_id: str, telegram_id: int, referred_by: Optional[str] = None) -> str:
        """創建新代理商"""
        try:
            # 檢查用戶是否已是代理商
            existing_agent = await self.get_agent_by_user_id(user_id)
            if existing_agent:
                raise ValueError("用戶已是代理商")
            
            # 生成推薦代碼
            referral_code = f"AGENT{telegram_id}"
            
            agent_data = {
                "user_id": user_id,
                "telegram_id": telegram_id,
                "referral_code": referral_code,
                "referred_by": referred_by,
                "level": AgentLevel.BRONZE.value,
                "status": AgentStatus.PENDING.value,
                
                # 統計數據
                "total_sales": 0.0,
                "total_commission": 0.0,
                "available_commission": 0.0,
                "withdrawn_commission": 0.0,
                "team_size": 0,
                "team_sales": 0.0,
                "direct_referrals": 0,
                
                # 時間戳
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "last_activity": datetime.utcnow(),
                "approved_at": None,
                
                # 月度統計
                "monthly_stats": {
                    "current_month": datetime.utcnow().strftime("%Y-%m"),
                    "monthly_sales": 0.0,
                    "monthly_commission": 0.0,
                    "monthly_team_growth": 0
                }
            }
            
            # 保存到 Firebase
            doc_ref = firebase_service.db.collection('agents').add(agent_data)
            agent_id = doc_ref[1].id
            
            # 如果有推薦人，更新推薦人的團隊統計
            if referred_by:
                await self._update_referrer_stats(referred_by, "new_referral")
            
            logger.info(f"創建代理商成功: {agent_id}")
            return agent_id
            
        except Exception as e:
            logger.error(f"創建代理商失敗: {e}")
            raise
    
    async def get_agent_by_user_id(self, user_id: str) -> Optional[Dict]:
        """根據用戶 ID 獲取代理商信息"""
        try:
            agents_ref = firebase_service.db.collection('agents')
            query = agents_ref.where('user_id', '==', user_id)
            docs = query.stream()
            
            for doc in docs:
                agent_data = doc.to_dict()
                agent_data['id'] = doc.id
                return agent_data
            
            return None
            
        except Exception as e:
            logger.error(f"獲取代理商信息失敗: {e}")
            return None
    
    async def get_agent_by_referral_code(self, referral_code: str) -> Optional[Dict]:
        """根據推薦代碼獲取代理商信息"""
        try:
            agents_ref = firebase_service.db.collection('agents')
            query = agents_ref.where('referral_code', '==', referral_code)
            docs = query.stream()
            
            for doc in docs:
                agent_data = doc.to_dict()
                agent_data['id'] = doc.id
                return agent_data
            
            return None
            
        except Exception as e:
            logger.error(f"根據推薦代碼獲取代理商失敗: {e}")
            return None
    
    async def approve_agent(self, agent_id: str) -> bool:
        """審核通過代理商申請"""
        try:
            agent_ref = firebase_service.db.collection('agents').document(agent_id)
            
            updates = {
                "status": AgentStatus.ACTIVE.value,
                "approved_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            agent_ref.update(updates)
            
            logger.info(f"代理商 {agent_id} 審核通過")
            return True
            
        except Exception as e:
            logger.error(f"審核代理商失敗: {e}")
            return False
    
    async def calculate_commission(self, agent_id: str, sale_amount: float) -> Dict[str, float]:
        """計算佣金"""
        try:
            agent = await self.get_agent_by_id(agent_id)
            if not agent:
                raise ValueError("代理商不存在")
            
            level = AgentLevel(agent['level'])
            config = self.level_config[level]
            
            # 計算直接佣金
            direct_commission = sale_amount * config['commission_rate']
            
            # 計算上級佣金（如果有推薦人）
            upline_commission = 0.0
            if agent.get('referred_by'):
                upline_agent = await self.get_agent_by_id(agent['referred_by'])
                if upline_agent and upline_agent['status'] == AgentStatus.ACTIVE.value:
                    upline_level = AgentLevel(upline_agent['level'])
                    upline_config = self.level_config[upline_level]
                    # 上級獲得 1% 的團隊佣金
                    upline_commission = sale_amount * 0.01
            
            return {
                "direct_commission": direct_commission,
                "upline_commission": upline_commission,
                "total_commission": direct_commission + upline_commission
            }
            
        except Exception as e:
            logger.error(f"計算佣金失敗: {e}")
            return {"direct_commission": 0.0, "upline_commission": 0.0, "total_commission": 0.0}
    
    async def record_sale(self, agent_id: str, sale_amount: float, order_id: str) -> bool:
        """記錄銷售並計算佣金"""
        try:
            agent = await self.get_agent_by_id(agent_id)
            if not agent:
                return False
            
            # 計算佣金
            commission_data = await self.calculate_commission(agent_id, sale_amount)
            
            # 更新代理商統計
            agent_ref = firebase_service.db.collection('agents').document(agent_id)
            
            current_month = datetime.utcnow().strftime("%Y-%m")
            
            updates = {
                "total_sales": agent['total_sales'] + sale_amount,
                "total_commission": agent['total_commission'] + commission_data['direct_commission'],
                "available_commission": agent['available_commission'] + commission_data['direct_commission'],
                "updated_at": datetime.utcnow(),
                "last_activity": datetime.utcnow(),
                f"monthly_stats.monthly_sales": agent.get('monthly_stats', {}).get('monthly_sales', 0) + sale_amount,
                f"monthly_stats.monthly_commission": agent.get('monthly_stats', {}).get('monthly_commission', 0) + commission_data['direct_commission'],
                f"monthly_stats.current_month": current_month
            }
            
            agent_ref.update(updates)
            
            # 記錄佣金記錄
            commission_record = {
                "agent_id": agent_id,
                "order_id": order_id,
                "sale_amount": sale_amount,
                "commission_amount": commission_data['direct_commission'],
                "commission_rate": self.level_config[AgentLevel(agent['level'])]['commission_rate'],
                "created_at": datetime.utcnow(),
                "status": "earned"
            }
            
            firebase_service.db.collection('commission_records').add(commission_record)
            
            # 如果有上級，也要更新上級統計
            if agent.get('referred_by') and commission_data['upline_commission'] > 0:
                await self._record_upline_commission(
                    agent['referred_by'], 
                    commission_data['upline_commission'],
                    order_id
                )
            
            # 檢查是否可以升級
            await self._check_level_upgrade(agent_id)
            
            logger.info(f"記錄銷售成功: agent={agent_id}, amount={sale_amount}, commission={commission_data['direct_commission']}")
            return True
            
        except Exception as e:
            logger.error(f"記錄銷售失敗: {e}")
            return False
    
    async def check_upgrade_eligibility(self, agent_id: str) -> Dict[str, Any]:
        """檢查升級資格"""
        try:
            agent = await self.get_agent_by_id(agent_id)
            if not agent:
                return {"eligible": False, "reason": "代理商不存在"}
            
            current_level = AgentLevel(agent['level'])
            current_config = self.level_config[current_level]
            
            # 如果已是最高等級
            if current_config['upgrade_requirements'] is None:
                return {"eligible": False, "reason": "已是最高等級"}
            
            requirements = current_config['upgrade_requirements']
            
            # 檢查各項要求
            checks = {
                "sales": agent['total_sales'] >= requirements['sales'],
                "team_size": agent['team_size'] >= requirements['team_size'],
                "active_days": self._calculate_active_days(agent['created_at']) >= requirements['active_days']
            }
            
            eligible = all(checks.values())
            
            return {
                "eligible": eligible,
                "current_level": current_level.value,
                "next_level": current_level.value + 1,
                "requirements": requirements,
                "current_stats": {
                    "sales": agent['total_sales'],
                    "team_size": agent['team_size'],
                    "active_days": self._calculate_active_days(agent['created_at'])
                },
                "checks": checks
            }
            
        except Exception as e:
            logger.error(f"檢查升級資格失敗: {e}")
            return {"eligible": False, "reason": "系統錯誤"}
    
    async def upgrade_agent_level(self, agent_id: str) -> bool:
        """升級代理商等級"""
        try:
            eligibility = await self.check_upgrade_eligibility(agent_id)
            
            if not eligibility['eligible']:
                return False
            
            new_level = eligibility['next_level']
            
            agent_ref = firebase_service.db.collection('agents').document(agent_id)
            
            updates = {
                "level": new_level,
                "updated_at": datetime.utcnow(),
                "last_upgrade": datetime.utcnow()
            }
            
            agent_ref.update(updates)
            
            # 記錄升級日誌
            upgrade_record = {
                "agent_id": agent_id,
                "from_level": eligibility['current_level'],
                "to_level": new_level,
                "upgraded_at": datetime.utcnow(),
                "requirements_met": eligibility['current_stats']
            }
            
            firebase_service.db.collection('agent_upgrades').add(upgrade_record)
            
            logger.info(f"代理商升級成功: {agent_id} -> Level {new_level}")
            return True
            
        except Exception as e:
            logger.error(f"升級代理商等級失敗: {e}")
            return False
    
    async def get_agent_stats(self, agent_id: str) -> Dict[str, Any]:
        """獲取代理商統計信息"""
        try:
            agent = await self.get_agent_by_id(agent_id)
            if not agent:
                return {}
            
            level = AgentLevel(agent['level'])
            config = self.level_config[level]
            
            # 計算本月統計
            current_month = datetime.utcnow().strftime("%Y-%m")
            monthly_stats = agent.get('monthly_stats', {})
            
            # 獲取團隊列表
            team_members = await self._get_team_members(agent_id)
            
            # 計算升級進度
            upgrade_eligibility = await self.check_upgrade_eligibility(agent_id)
            
            return {
                "agent_info": {
                    "id": agent_id,
                    "level": level.value,
                    "level_name": config['name'],
                    "level_icon": config['icon'],
                    "status": agent['status'],
                    "referral_code": agent['referral_code']
                },
                "financial": {
                    "total_sales": agent['total_sales'],
                    "total_commission": agent['total_commission'],
                    "available_commission": agent['available_commission'],
                    "withdrawn_commission": agent['withdrawn_commission'],
                    "commission_rate": config['commission_rate']
                },
                "team": {
                    "team_size": agent['team_size'],
                    "direct_referrals": agent['direct_referrals'],
                    "team_sales": agent['team_sales'],
                    "team_members": team_members
                },
                "monthly": {
                    "current_month": current_month,
                    "monthly_sales": monthly_stats.get('monthly_sales', 0),
                    "monthly_commission": monthly_stats.get('monthly_commission', 0),
                    "monthly_bonus": config['monthly_bonus']
                },
                "upgrade": upgrade_eligibility
            }
            
        except Exception as e:
            logger.error(f"獲取代理商統計失敗: {e}")
            return {}
    
    async def get_agent_by_id(self, agent_id: str) -> Optional[Dict]:
        """根據 ID 獲取代理商"""
        try:
            doc_ref = firebase_service.db.collection('agents').document(agent_id)
            doc = doc_ref.get()
            
            if doc.exists:
                agent_data = doc.to_dict()
                agent_data['id'] = doc.id
                return agent_data
            
            return None
            
        except Exception as e:
            logger.error(f"獲取代理商失敗: {e}")
            return None
    
    def _calculate_active_days(self, created_at: datetime) -> int:
        """計算活躍天數"""
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
        
        return (datetime.utcnow() - created_at).days
    
    async def _update_referrer_stats(self, referrer_id: str, action: str):
        """更新推薦人統計"""
        try:
            referrer_ref = firebase_service.db.collection('agents').document(referrer_id)
            
            if action == "new_referral":
                referrer_ref.update({
                    "direct_referrals": firebase_service.db.FieldValue.increment(1),
                    "team_size": firebase_service.db.FieldValue.increment(1),
                    "updated_at": datetime.utcnow()
                })
                
        except Exception as e:
            logger.error(f"更新推薦人統計失敗: {e}")
    
    async def _record_upline_commission(self, upline_agent_id: str, commission: float, order_id: str):
        """記錄上級佣金"""
        try:
            upline_ref = firebase_service.db.collection('agents').document(upline_agent_id)
            
            upline_ref.update({
                "total_commission": firebase_service.db.FieldValue.increment(commission),
                "available_commission": firebase_service.db.FieldValue.increment(commission),
                "team_sales": firebase_service.db.FieldValue.increment(commission * 100),  # 假設佣金是銷售額的1%
                "updated_at": datetime.utcnow()
            })
            
            # 記錄佣金記錄
            commission_record = {
                "agent_id": upline_agent_id,
                "order_id": order_id,
                "commission_amount": commission,
                "commission_type": "team_bonus",
                "created_at": datetime.utcnow(),
                "status": "earned"
            }
            
            firebase_service.db.collection('commission_records').add(commission_record)
            
        except Exception as e:
            logger.error(f"記錄上級佣金失敗: {e}")
    
    async def _check_level_upgrade(self, agent_id: str):
        """檢查並自動升級等級"""
        try:
            eligibility = await self.check_upgrade_eligibility(agent_id)
            
            if eligibility['eligible']:
                await self.upgrade_agent_level(agent_id)
                
        except Exception as e:
            logger.error(f"檢查等級升級失敗: {e}")
    
    async def _get_team_members(self, agent_id: str) -> List[Dict]:
        """獲取團隊成員列表"""
        try:
            agents_ref = firebase_service.db.collection('agents')
            query = agents_ref.where('referred_by', '==', agent_id)
            docs = query.stream()
            
            team_members = []
            for doc in docs:
                member_data = doc.to_dict()
                member_data['id'] = doc.id
                team_members.append({
                    "id": member_data['id'],
                    "telegram_id": member_data['telegram_id'],
                    "level": member_data['level'],
                    "total_sales": member_data['total_sales'],
                    "status": member_data['status'],
                    "joined_at": member_data['created_at']
                })
            
            return team_members
            
        except Exception as e:
            logger.error(f"獲取團隊成員失敗: {e}")
            return []

# 創建全局代理商服務實例
agent_service = AgentService()
