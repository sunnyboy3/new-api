/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useEffect, useState } from 'react';
import { API, showError } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import NoticeModal from '../../components/layout/NoticeModal';

const relayHighlights = [
  { value: '服务明示', label: '功能与权益展示清晰' },
  { value: '支付透明', label: '金额订单支付状态可查' },
  { value: '合规运营', label: '声明审计与风控闭环' },
];

const serviceBadges = [
  '微信支付场景友好',
  '服务内容清晰展示',
];

const relayScenarios = [
  {
    title: '服务内容明示',
    description:
      '首页展示 AI 模型接入、额度管理、用量审计等实际服务内容，避免模糊宣传。',
  },
  {
    title: '订单支付透明',
    description:
      '支付前展示服务权益、订单金额与支付状态，支付后按订单完成额度交付和记录留存。',
  },
  {
    title: '用户权益保障',
    description:
      '提供公告、用户协议、隐私政策、订单记录和售后处理入口，便于用户查询与反馈。',
  },
  {
    title: '合规运营管控',
    description:
      '支付、订阅、兑换码等能力与合规声明联动，提醒运营方履行备案、安全和内容治理责任。',
  },
];

const complianceCards = [
  {
    title: '支付前信息确认',
    description:
      '清楚展示服务内容、权益周期、订单金额和支付方式，用户确认后再发起支付。',
  },
  {
    title: '交易记录留存',
    description:
      '订单、支付状态、额度交付和用量明细可查询，便于对账、售后和风险核查。',
  },
  {
    title: '隐私与安全保护',
    description:
      '通过用户协议、隐私政策、密钥托管和访问控制，明确数据使用边界。',
  },
  {
    title: '合规提醒内置',
    description:
      '涉及生成式 AI 服务、收费、订阅和推广时，提示运营方依法履行相关合规义务。',
  },
];

const relaySteps = ['选择服务', '确认订单', '安全支付', '额度交付', '用量审计'];

const Home = () => {
  const { t, i18n } = useTranslation();
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isChinese = i18n.language.startsWith('zh');

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    displayHomePageContent().then();
  }, []);

  return (
    <div className='classic-page-fill classic-home-page w-full overflow-x-hidden'>
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {homePageContentLoaded && homePageContent === '' ? (
        <div className='classic-home-default w-full overflow-x-hidden'>
          <section className='classic-token-hero w-full border-b border-semi-color-border relative overflow-hidden'>
            <div className='classic-token-grid' />
            <div className='classic-home-container'>
              <div className='classic-token-hero-layout'>
                <div className='classic-token-copy'>
                  <div className='classic-token-eyebrow'>
                    <span className='classic-token-pulse' />
                    {t('')}
                  </div>
                  <p className='classic-token-subtitle'>
                    {t(
                      '为用户提供明确的 AI 模型调用、额度管理和用量记录服务。平台在支付前展示服务内容、订单金额和权益说明，支付后完成额度交付并保留订单与调用记录，便于用户查询、售后处理和合规核查。',
                    )}
                  </p>
                  <div className='classic-token-badges'>
                    {serviceBadges.map((badge) => (
                      <span key={badge}>{t(badge)}</span>
                    ))}
                  </div>
                </div>

                <div
                  className='classic-token-console'
                  aria-label='relay console preview'
                >
                  <div className='classic-token-console-head'>
                    <div>
                      <span>{t('支付与服务流程')}</span>
                      <strong>{t('订单交付运行态')}</strong>
                    </div>
                    <em>{t('运行中')}</em>
                  </div>
                  <div className='classic-token-route'>
                    {relaySteps.map((step, index) => (
                      <React.Fragment key={step}>
                        <div className='classic-token-route-node'>
                          {t(step)}
                        </div>
                        {index < relaySteps.length - 1 && (
                          <div className='classic-token-route-line' />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className='classic-token-metrics'>
                    {relayHighlights.map((item) => (
                      <div className='classic-token-metric' key={item.label}>
                        <strong>{item.value}</strong>
                        <span>{t(item.label)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className='classic-token-scenarios'>
                {relayScenarios.map((item, index) => (
                  <div className='classic-token-scenario-card' key={item.title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <h3>{t(item.title)}</h3>
                    <p>{t(item.description)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className='classic-page-fill overflow-x-hidden w-full'>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className='w-full h-full border-none'
            />
          ) : (
            <div
              className='mt-[60px]'
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
