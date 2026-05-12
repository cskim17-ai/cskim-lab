import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import html2canvas from 'html2canvas';

const urlParams = new URLSearchParams(window.location.search);
const deskId = urlParams.get('desk_id');
const container = document.getElementById('content-container');
const saveBtn = document.getElementById('save-btn');

function getProxyImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('https://contents.kyobobook.co.kr')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

function renderNativeInfo(data: any, barcode: string) {
  const titleEl = document.getElementById('native-title');
  const metaEl = document.getElementById('native-meta');
  const stockEl = document.getElementById('stock-count');
  const telEl = document.getElementById('store-tel');
  const locationList = document.getElementById('location-list');
  const mapImg = document.getElementById('location-map') as HTMLImageElement;
  const isbnEl = document.getElementById('isbn-text');
  
  if (data.kbCommodityData?.data?.commodityInfo) {
    const info = data.kbCommodityData.data.commodityInfo;
    if (titleEl) titleEl.textContent = info.cmdtName;
    if (metaEl) metaEl.textContent = `${info.chrcName} | ${info.pbcmName} | ${info.rlseDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')} | ${info.saleCmdtPrce.toLocaleString()}원`;
  } else if (data.fallback) {
    if (titleEl) titleEl.textContent = data.kbCommodityData?.data?.commodityInfo?.cmdtName || '도서 정보';
    if (metaEl) metaEl.textContent = data.authorInfo || '';
  }
  
  if (data.kbCommodityInventoryData?.data?.inventory) {
    if (stockEl) stockEl.textContent = data.kbCommodityInventoryData.data.inventory.realInvnQntt.toString();
  }
  
  if (data.storeInfoTelData?.data?.storeTel) {
    if (telEl) telEl.textContent = `매장전화: ${data.storeInfoTelData.data.storeTel.storeTelNum}`;
  }
  
  if (data.bookShelfData?.data?.bookShelfInfos) {
    if (locationList) {
      locationList.innerHTML = '';
      data.bookShelfData.data.bookShelfInfos.forEach((loc: any) => {
        const div = document.createElement('div');
        div.style.marginBottom = '15px';
        div.innerHTML = `<div style="font-weight: 700; font-size: 15px;">[${loc.pavilion} ${loc.bkshNum}] <span style="font-weight: 400;">${loc.bkshDvsnNm}</span></div><div style="font-size: 13px; color: #333;">${loc.bkshNm}</div>`;
        locationList.appendChild(div);
      });
    }
  }
  
  if (mapImg) {
    const mapUrl = data.bookShelfMapData?.data?.bookShelfMapUrl || data.mapUrl;
    if (mapUrl) {
      mapImg.src = getProxyImageUrl(mapUrl);
    }
  }
  
  if (isbnEl) isbnEl.textContent = barcode;
}

if (!container) {
  console.error("Container not found");
} else if (!deskId) {
  container.innerHTML = '<p>desk_id 파라미터가 없습니다. URL을 확인해 주세요.</p>';
} else {
  // src/firebase.ts에서 초기화된 db 객체를 재사용하여 Firestore 연동
  onSnapshot(doc(db, "active_session", deskId), (docSnap) => {
    const overlay = document.getElementById('loading-overlay');
    const loadingMsg = document.getElementById('loading-msg');
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const bookCover = document.getElementById('book-cover') as HTMLImageElement;
      
      if (data.url) {
        // URL에서 바코드 추출
        const urlParams = new URL(data.url).searchParams;
        const barcode = urlParams.get('barcode');
        
        if (barcode) {
          if (bookCover) {
            bookCover.src = getProxyImageUrl(`https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/${barcode}.jpg`);
          }

          // Fetch detailed info via our server proxy
          fetch(`/api/book-info?barcode=${barcode}`)
            .then(res => res.json())
            .then(bookInfo => {
              renderNativeInfo(bookInfo, barcode);
              
              // 콘텐츠 표시
              if (container) {
                container.style.visibility = 'visible';
                if (overlay) overlay.style.display = 'none';
                if (saveBtn) saveBtn.style.display = 'block';
              }
            })
            .catch(err => {
              console.error('Fetch error:', err);
              if (loadingMsg) loadingMsg.textContent = '정보를 가져오는 중 오류가 발생했습니다.';
            });
        }
      } else if (data.content) {
        // 이전 방식 호환성 유지: content 필드를 innerHTML로 삽입
        if (container) {
          container.innerHTML = data.content;
          container.style.visibility = 'visible';
          if (overlay) overlay.style.display = 'none';
          if (saveBtn) saveBtn.style.display = 'block';
        }
      } else {
        if (loadingMsg) loadingMsg.textContent = '전달된 콘텐츠가 없습니다.';
        if (saveBtn) saveBtn.style.display = 'none';
      }
    } else {
      if (loadingMsg) loadingMsg.textContent = `${deskId} 화면에 전송된 데이터가 없습니다.`;
      if (saveBtn) saveBtn.style.display = 'none';
    }
  }, (error) => {
    console.error("Firestore error: ", error);
    container.innerHTML = '<p>데이터를 불러오는 중 오류가 발생했습니다.</p>';
  });
}

// 저장하기 기능 구현
if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    if (!container) return;
    
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '작업중';
    saveBtn.setAttribute('disabled', 'true');

    try {
      // html2canvas 옵션: CORS 허용 및 스케일 조정
      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        scale: 2, // 고해상도 저장
        logging: false,
        imageTimeout: 15000 // 이미지 로드 타임아웃 넉넉히
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const now = new Date();
      const timestamp = now.getFullYear().toString() + 
                        (now.getMonth() + 1).toString().padStart(2, '0') + 
                        now.getDate().toString().padStart(2, '0') + "_" + 
                        now.getHours().toString().padStart(2, '0') + 
                        now.getMinutes().toString().padStart(2, '0');
      
      link.download = `book_info_${timestamp}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('이미지가 저장되었습니다.');
    } catch (error) {
      console.error('Save error:', error);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      saveBtn.textContent = originalText;
      saveBtn.removeAttribute('disabled');
    }
  });
}
