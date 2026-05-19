

const CareerResources = () => {
  return (
    <div className="space-y-stack-md">
      <h4 className="font-bold text-on-surface-variant text-body-sm uppercase tracking-widest">Tài Nguyên Sự Nghiệp</h4>
      <a className="flex gap-stack-md group" href="#">
        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            alt="Lời khuyên" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYGqlS4s03d0mzNBy9VMB0FbGxJcmws_C5PlcWTqa4axcvDe1MuB_BaIZ7DcMf_UWNyLuy3Ts5bbLspezlgTv5JFgIezDg23qlpHtXtQf16byCCovZgBc5gtMF6GsbfirJcye6nVKjDNi3nj9U7nCGJXujk4jFM2ddj0hPANMfddqJJXJ_sGxGKsCOkSq-0x_WhyKTVUfTYLRv7mpJO1nYHjx_k2jsNYs4BgpWNE4PoGT1U40R5eR7-H5z-c0lmIGUba6AkjOgYhez"
          />
        </div>
        <div>
          <p className="font-bold text-body-sm group-hover:text-primary transition-colors">Cách xử lý 'Khoảng trống nghề nghiệp' trong CV</p>
          <p className="text-body-sm text-on-surface-variant">5 phút đọc • Tư vấn sự nghiệp</p>
        </div>
      </a>
    </div>
  );
};

export default CareerResources;
