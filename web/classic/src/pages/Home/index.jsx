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

import React, { useContext, useEffect, useState } from 'react';
import { Button, Input, ScrollList, ScrollItem } from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';

const relayHighlights = [
  { value: '40+', label: '上游模型渠道' },
  { value: '99.9%', label: '业务可用性设计' },
  { value: '1 URL', label: '统一接入地址' },
];

const relayScenarios = [
  {
    title: '统一 Token 中转',
    description: 'OpenAI 兼容协议承接业务流量，统一转发到不同模型与供应商。',
  },
  {
    title: '额度与计费闭环',
    description: '按用户、密钥、模型维度记录消耗，让充值、扣费和审计更清晰。',
  },
  {
    title: '密钥隔离托管',
    description:
      '业务侧只持有平台密钥，上游 Key 集中管理，降低泄露和滥用风险。',
  },
  {
    title: '多渠道容灾路由',
    description: '把限速、故障、成本和模型能力纳入统一调度，稳定承接生产请求。',
  },
];

const relaySteps = ['业务请求', '统一鉴权', '额度校验', '智能路由', '模型响应'];

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress =
    statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
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

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
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

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

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
                    {t('Token Relay Infrastructure')}
                  </div>
                  <h1
                    className={`classic-token-title ${isChinese ? 'classic-token-title-zh' : ''}`}
                  >
                    {t('稳定承接 AI Token 流量')}
                    <span>{t('统一中转、计费与路由')}</span>
                  </h1>
                  <p className='classic-token-subtitle'>
                    {t(
                      '面向 AI 应用、SaaS 平台与企业内部系统，提供统一 Base URL、密钥托管、额度扣费、模型路由和用量审计，让业务请求稳定转发到 OpenAI、Claude、Gemini、DeepSeek 等上游模型。',
                    )}
                  </p>

                  <div className='classic-token-basebox'>
                    <div className='classic-token-basebox-label'>
                      {t('业务侧只需替换 Base URL')}
                    </div>
                    <Input
                      readonly
                      value={serverAddress}
                      className='classic-token-base-input'
                      size={isMobile ? 'default' : 'large'}
                      suffix={
                        <div className='classic-token-endpoint'>
                          <ScrollList
                            bodyHeight={32}
                            style={{ border: 'unset', boxShadow: 'unset' }}
                          >
                            <ScrollItem
                              mode='wheel'
                              cycled={true}
                              list={endpointItems}
                              selectedIndex={endpointIndex}
                              onSelect={({ index }) => setEndpointIndex(index)}
                            />
                          </ScrollList>
                          <Button
                            type='primary'
                            onClick={handleCopyBaseURL}
                            icon={<IconCopy />}
                            className='classic-token-copy-button'
                          />
                        </div>
                      }
                    />
                  </div>

                  <div className='classic-token-actions'>
                    <Link to='/console'>
                      <Button
                        theme='solid'
                        type='primary'
                        size={isMobile ? 'default' : 'large'}
                        className='classic-token-primary-action'
                        icon={<IconPlay />}
                      >
                        {t('立即接入')}
                      </Button>
                    </Link>
                    {isDemoSiteMode && statusState?.status?.version ? (
                      <Button
                        size={isMobile ? 'default' : 'large'}
                        className='classic-token-secondary-action'
                        icon={<IconGithubLogo />}
                        onClick={() =>
                          window.open(
                            'https://github.com/QuantumNous/new-api',
                            '_blank',
                          )
                        }
                      >
                        {statusState.status.version}
                      </Button>
                    ) : (
                      docsLink && (
                        <Button
                          size={isMobile ? 'default' : 'large'}
                          className='classic-token-secondary-action'
                          icon={<IconFile />}
                          onClick={() => window.open(docsLink, '_blank')}
                        >
                          {t('查看接入文档')}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                <div
                  className='classic-token-console'
                  aria-label='relay console preview'
                >
                  <div className='classic-token-console-head'>
                    <div>
                      <span>{t('Relay Control Plane')}</span>
                      <strong>{t('Token 中转运行态')}</strong>
                    </div>
                    <em>{t('Live')}</em>
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
                  <div className='classic-token-terminal'>
                    <div>
                      <span>POST</span>
                      <code>/v1/chat/completions</code>
                    </div>
                    <p>{`model: ${endpointItems[endpointIndex]?.value || 'gpt-4o'}`}</p>
                    <p>{t('quota checked -> routed -> settled')}</p>
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
