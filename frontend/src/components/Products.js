import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Products(){
  return (
    <div className="landing-page">


      <div className="hero-section">
         <div className="hero-content">
            <h1>THE COLLECTIONS</h1>
            <p>We've created a piece for the modern architectural elite.</p>
             <Link to="/products">
               <button className="btn-explore">EXPLORE ALL</button>
             </Link>
         </div>
      </div>

      <div className="category-section">
         <div className="cat-header flex-between" style={{marginBottom:'32px'}}>
            <div>
               <div style={{fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'4px'}}>CURATION</div>
               <h2>Browse by Category</h2>
            </div>
         </div>

         <div className="cat-grid">
            <Link to="/products?category=outerwear" className="cat-card outerwear">
               <div className="cat-overlay">
                  <h3>Outerwear</h3>
                  <span>SHOP THE CAPSULE</span>
               </div>
            </Link>
            <Link to="/products?category=knitwear" className="cat-card knitwear">
               <div className="cat-overlay">
                  <h3>Knitwear</h3>
                  <span>SHOP THE FLEECE</span>
               </div>
            </Link>
            <Link to="/products?category=accessories" className="cat-card accessories">
               <div className="cat-overlay">
                  <h3>Accessories</h3>
                  <span>SHOP LEATHER</span>
               </div>
            </Link>
            <Link to="/products?category=footwear" className="cat-card footwear">
               <div className="cat-overlay">
                  <h3>Footwear</h3>
                  <span>SHOP ARRIVALS</span>
               </div>
            </Link>
         </div>
      </div>



      <div className="editorial-section">
         <div className="editorial-text">
            <div style={{fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'16px'}}>OUR ETHOS</div>
            <h2>Design as a Dialogue.</h2>
            <p>At LUMINA, we believe clothing should be an extension of the self. Each piece is a result of obsessive precision—balancing the soft curves of the human form with the sharp lines of modern architecture.</p>
            <p style={{fontStyle:'italic', color:'var(--text-secondary)'}}>"Luxury is not about excess. It's about the space between what is necessary and what is profound."</p>
            <Link to="/craft" className="learn-more">LEARN ABOUT OUR CRAFT</Link>
         </div>
         <div className="editorial-images">
            <div className="ed-img ed-img-1"></div>
            <div className="ed-img ed-img-2"></div>
         </div>
      </div>



      <footer className="footer" style={{marginTop:0, paddingTop:'60px', borderTop:'none'}}>
         <div className="footer-cols container">
           <div className="footer-col brand-col">
             <h3>LUMINA</h3>
             <p>Curating the intersection of timeless minimalism and contemporary silhouette. Designed in London, crafted for the world.</p>
           </div>
           <div className="footer-col">
              <h4>EXPLORE</h4>
              <a href="#">Collections</a>
              <a href="#">New Arrivals</a>
              <a href="/store-locator">Store Locator</a>
           </div>
           <div className="footer-col">
              <h4>ASSISTANCE</h4>
              <a href="/shipping-returns">Shipping & Returns</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms-of-service">Terms of Service</a>
           </div>
           <div className="footer-col" style={{textAlign:'right'}}>
              <div className="socials" style={{justifyContent:'flex-end'}}>
                 <div className="social-icon">IN</div>
                 <div className="social-icon">IG</div>
              </div>
              <p style={{marginTop:'40px', fontSize:'10px', color:'var(--text-secondary)'}}>© 2024 LUMINA. ALL RIGHTS RESERVED.</p>
           </div>
         </div>
      </footer>
    </div>
  );
}
