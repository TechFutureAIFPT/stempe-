import React from 'react';
import ResponsiveLayout from '../responsive/ResponsiveLayout';
import ResponsiveGrid from '../responsive/ResponsiveGrid';
import ResponsiveCard from '../responsive/ResponsiveCard';
import ResponsiveButton from '../responsive/ResponsiveButton';
import ResponsiveImage from '../responsive/ResponsiveImage';
import { useDeviceDetection } from '../responsive/useDeviceDetection';

const ResponsiveDemo: React.FC = () => {
  const device = useDeviceDetection();
  
  return (
    <ResponsiveLayout>
      <div className="spacing-responsive">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-white font-bold mb-4">
            Responsive Design Demo
          </h1>
          <p className="text-slate-400 text-responsive-base">
            Hiện tại bạn đang sử dụng: <span className="text-cyan-400 font-semibold">{device.type}</span>
            {' '}({device.width}x{device.height})
          </p>
        </div>

        {/* Responsive Grid Demo */}
        <ResponsiveCard 
          title="Responsive Grid System"
          subtitle="Grid tự động điều chỉnh theo thiết bị"
          className="mb-6"
        >
          <ResponsiveGrid 
            mobileColumns={1}
            tabletColumns={2}
            desktopColumns={3}
            gap="md"
          >
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-4 rounded-lg text-center">
              <h3 className="text-white font-semibold mb-2">Feature 1</h3>
              <p className="text-slate-300 text-sm">
                Tính năng đầu tiên với mô tả chi tiết
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-4 rounded-lg text-center">
              <h3 className="text-white font-semibold mb-2">Feature 2</h3>
              <p className="text-slate-300 text-sm">
                Tính năng thứ hai với thiết kế responsive
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-lg text-center">
              <h3 className="text-white font-semibold mb-2">Feature 3</h3>
              <p className="text-slate-300 text-sm">
                Tính năng thứ ba được tối ưu cho mọi thiết bị
              </p>
            </div>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Responsive Buttons Demo */}
        <ResponsiveCard 
          title="Responsive Buttons"
          subtitle="Nút bấm tự động điều chỉnh kích thước"
          className="mb-6"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <ResponsiveButton variant="primary" size="sm">
                Small Button
              </ResponsiveButton>
              <ResponsiveButton variant="secondary" size="md">
                Medium Button  
              </ResponsiveButton>
              <ResponsiveButton variant="outline" size="lg">
                Large Button
              </ResponsiveButton>
            </div>
            
            <ResponsiveButton 
              variant="primary" 
              fullWidth
              icon={<i className="fas fa-download" />}
            >
              Full Width Button với Icon
            </ResponsiveButton>
          </div>
        </ResponsiveCard>

        {/* Device-specific Content */}
        <ResponsiveCard 
          title="Device-Specific Content"
          subtitle="Nội dung thay đổi theo từng loại thiết bị"
          className="mb-6"
        >
          {/* Mobile Content */}
          <div className="mobile-only bg-cyan-500/10 p-4 rounded-lg border border-cyan-500/20">
            <h4 className="text-cyan-400 font-semibold mb-2">
              <i className="fas fa-mobile-alt mr-2"></i>
              Mobile Experience
            </h4>
            <p className="text-slate-300 text-sm">
              Giao diện tối ưu cho điện thoại với navigation dưới cùng và touch controls.
            </p>
          </div>

          {/* Tablet Content */}
          <div className="tablet-only bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
            <h4 className="text-purple-400 font-semibold mb-2">
              <i className="fas fa-tablet-alt mr-2"></i>
              Tablet Experience
            </h4>
            <p className="text-slate-300 text-sm">
              Giao diện lai giữa mobile và desktop với pop-over sidebar và touch-optimized controls.
            </p>
          </div>

          {/* Desktop Content */}
          <div className="desktop-only bg-green-500/10 p-4 rounded-lg border border-green-500/20">
            <h4 className="text-green-400 font-semibold mb-2">
              <i className="fas fa-desktop mr-2"></i>
              Desktop Experience
            </h4>
            <p className="text-slate-300 text-sm">
              Giao diện đầy đủ với sidebar cố định, hover effects và các tính năng nâng cao.
            </p>
          </div>
        </ResponsiveCard>

        {/* Responsive Images Demo */}
        <ResponsiveCard 
          title="Responsive Images"
          subtitle="Hình ảnh tự động điều chỉnh kích thước"
          className="mb-6"
        >
          <div className="text-center">
            <ResponsiveImage
              src="/images/logos/logo.jpg"
              alt="Support HR Logo"
              mobileSize="md"
              tabletSize="lg"
              desktopSize="xl"
              className="mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 border border-slate-600/50 p-2"
            />
            <p className="text-slate-400 text-sm">
              Logo thay đổi kích thước theo thiết bị
            </p>
          </div>
        </ResponsiveCard>

        {/* Technical Info */}
        <ResponsiveCard 
          title="Technical Information"
          subtitle="Chi tiết kỹ thuật về responsive system"
          className="mb-6"
        >
          <div className="grid gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Device Type:</span>
              <span className="text-white font-mono">{device.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Screen Size:</span>
              <span className="text-white font-mono">{device.width} x {device.height}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Is Mobile:</span>
              <span className={`font-mono ${device.isMobile ? 'text-green-400' : 'text-red-400'}`}>
                {device.isMobile ? 'true' : 'false'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Is Tablet:</span>
              <span className={`font-mono ${device.isTablet ? 'text-green-400' : 'text-red-400'}`}>
                {device.isTablet ? 'true' : 'false'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Is Desktop:</span>
              <span className={`font-mono ${device.isDesktop ? 'text-green-400' : 'text-red-400'}`}>
                {device.isDesktop ? 'true' : 'false'}
              </span>
            </div>
          </div>
        </ResponsiveCard>
      </div>
    </ResponsiveLayout>
  );
};

export default ResponsiveDemo;