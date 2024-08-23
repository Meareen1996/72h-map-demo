
import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { HeatMapOutlined, UnderlineOutlined } from '@ant-design/icons';
import { Outlet, useLocation,useNavigate } from 'react-router-dom';
const { Sider } = Layout;

const menuItems = [
    {
        key: '/map',
        label: 'Map',
        icon: <HeatMapOutlined />
    },
    {
        key: '/list',
        label: 'List',
        icon: <UnderlineOutlined />
    }
]

const LayoutComponent = () => {
    const  navigate  = useNavigate();
    const handleClick = (e) => {
        navigate(e.key);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
            breakpoint="lg"
            collapsedWidth="0"
            onBreakpoint={broken => {
                console.log(broken);
            }}
            onCollapse={collapsed => {
                console.log(collapsed);
            }}
            >
            <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={[menuItems[0].key]}
                onClick={handleClick}
                items={menuItems}
            >
            </Menu>
            </Sider>
            <Layout className="site-layout">
            <Layout.Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
                <Outlet />
            </Layout.Content>
            </Layout>
        </Layout>
        );
};


export default LayoutComponent;