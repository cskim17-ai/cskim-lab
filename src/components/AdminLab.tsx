import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle } from 'lucide-react';
import { setDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useState, useEffect } from 'react';

interface AdminLabProps {
  showAlert: (message: string) => void;
  showConfirm?: (message: string, callback: () => void) => void;
}

export default function AdminLab({ showAlert }: AdminLabProps) {
  const [labProductCode, setLabProductCode] = useState('');
  const [labOutputUrl, setLabOutputUrl] = useState('');
  const [labQrResult, setLabQrResult] = useState('');
  const [labTransferResult, setLabTransferResult] = useState('');
  const [activeNfcIds, setActiveNfcIds] = useState<string[]>([]);
  const [selectedNfcId, setSelectedNfcId] = useState('');
  const [nfcTaggingUrl, setNfcTaggingUrl] = useState('');

  // config_desks에서 status가 'active'인 nfc_id 조회
  useEffect(() => {
    const fetchActiveNfcIds = async () => {
      const path = 'config_desks';
      try {
        const q = query(collection(db, path), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        const nfcIds = querySnapshot.docs.map(doc => doc.data().nfc_id).filter(Boolean);
        setActiveNfcIds(nfcIds);
        if (nfcIds.length > 0) {
          setSelectedNfcId(nfcIds[0]);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    };
    fetchActiveNfcIds();
  }, []);

  // selectedNfcId 변경 시 NFC 태깅 URL 업데이트
  useEffect(() => {
    if (selectedNfcId) {
      const baseUrl = window.location.origin;
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
      // srch-view.html이 삭제되었으므로 메인 페이지로 연결하거나 다른 처리가 필요할 수 있습니다.
      // 현재는 메인 페이지로 연결되도록 수정합니다.
      const url = `${baseUrl}${basePath}/?desk_id=${selectedNfcId}`;
      setNfcTaggingUrl(url);
    }
  }, [selectedNfcId]);

  const handleSearch = () => {
    if (labProductCode) {
      const sanitizedCode = encodeURIComponent(labProductCode);
      setLabOutputUrl(`https://kiosk.kyobobook.co.kr/bookInfoInk?site=001&barcode=${sanitizedCode}&ejkGb=KOR`);
      setLabQrResult('');
      setLabTransferResult('');
    } else {
      showAlert('상품코드를 입력해주세요.');
    }
  };

  const handleQrTransfer = () => {
    if (labOutputUrl) {
      setLabQrResult('QR 전송이 완료되었습니다.');
    } else {
      showAlert('먼저 조회를 실행해주세요.');
    }
  };

  const handleNfcTransfer = async () => {
    if (!labOutputUrl) {
      showAlert('먼저 조회를 실행해주세요.');
      return;
    }
    if (!selectedNfcId) {
      showAlert('NFC ID를 선택해주세요.');
      return;
    }
    
    const path = `active_session/${selectedNfcId}`;
    try {
      const sanitizedCode = encodeURIComponent(labProductCode);
      // active_session에 nfc_id를 문서 ID로 사용하여 생성/업데이트
      const combinedContent = `<div style="width: 100%; height: 100%; overflow-y: auto; background-color: white; display: flex; flex-direction: column; align-items: center; padding-top: 15px;">
        <img src="https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/${sanitizedCode}.jpg" style="width: 70%; max-width: 250px; object-fit: contain; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border-radius: 8px; margin-bottom: 10px;" alt="도서표지" onerror="this.style.display='none'" />
        <iframe src="${labOutputUrl}" style="width:100%; min-height: 800px; flex-grow: 1; border:none;"></iframe>
      </div>`;

      await setDoc(doc(db, 'active_session', selectedNfcId), {
        desk_id: selectedNfcId,
        content: combinedContent,
        url: labOutputUrl,
        updatedAt: new Date().toISOString()
      });
      
      const nfcMessage = `NFC 전송이 성공적으로 완료되었습니다!\n\n전송 정보:\n- URL: ${labOutputUrl}\n- NFC ID: ${selectedNfcId}\n- 전송시간: ${new Date().toLocaleTimeString()}`;
      setLabTransferResult('NFC 전송이 성공적으로 완료되었습니다!');
      showAlert(nfcMessage);
    } catch (error) {
      setLabTransferResult('NFC 전송 실패: ' + (error as Error).message);
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <motion.div
      key="lab"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl sm:text-3xl serif italic">NFC전송</h2>
      </div>

      <div className="glass p-4 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-white/10 space-y-6 sm:space-y-8">
        {/* Row 1: Input and Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <label className="text-sm sm:text-lg font-bold whitespace-nowrap min-w-[120px]">상품코드 입력</label>
            <input 
              type="text"
              value={labProductCode}
              onChange={(e) => setLabProductCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-grow focus:border-lime outline-none transition-all text-sm sm:text-base"
              placeholder="상품코드를 입력하세요"
            />
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <button 
              onClick={handleSearch}
              className="bg-lime text-forest px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all flex-1 sm:flex-none text-sm"
            >
              조회
            </button>
            <button 
              onClick={handleQrTransfer}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold border border-white/20 transition-all flex-1 sm:flex-none text-sm"
            >
              URL QR전송
            </button>
            <button 
              onClick={handleNfcTransfer}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold border border-white/20 transition-all flex-1 sm:flex-none text-sm"
            >
              NFC
            </button>
          </div>
        </div>

        {/* NFC ID 선택 드롭다운 */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <label className="text-sm sm:text-lg font-bold whitespace-nowrap min-w-[120px]">NFC ID 선택</label>
          <div className="relative w-full flex-grow">
            <select
              value={selectedNfcId}
              onChange={(e) => setSelectedNfcId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-lime outline-none transition-all text-white appearance-none text-sm sm:text-base"
            >
              <option value="" className="bg-forest text-white">-- NFC ID를 선택하세요 --</option>
              {activeNfcIds.map((nfcId) => (
                <option key={nfcId} value={nfcId} className="bg-forest text-white">
                  {nfcId}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <span className="text-[10px] sm:text-xs opacity-60 whitespace-nowrap">
            {activeNfcIds.length > 0 ? `(${activeNfcIds.length}개 활성)` : '활성 NFC ID 없음'}
          </span>
        </div>

        {/* Row 2: Output URL */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <label className="text-sm sm:text-lg font-bold whitespace-nowrap min-w-[120px]">출력 URL</label>
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-grow w-full min-h-[50px] break-all text-white/50 text-[10px] sm:text-xs">
            {labOutputUrl || '조회 후 URL이 표시됩니다'}
          </div>
        </div>

        {/* NFC 태깅 URL */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <label className="text-sm sm:text-lg font-bold whitespace-nowrap min-w-[120px]">NFC 태깅 URL</label>
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-grow w-full min-h-[50px] break-all text-white/50 text-[10px] sm:text-xs">
            {nfcTaggingUrl || 'NFC ID를 선택하면 URL이 표시됩니다'}
          </div>
        </div>

        {/* Row 3: Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {/* URL Result */}
          <div className="space-y-3">
            <h3 className="text-center text-sm sm:text-base font-bold opacity-60">URL 설정결과</h3>
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white aspect-square sm:aspect-[3/4] relative shadow-inner">
              {labOutputUrl ? (
                <iframe 
                  src={labOutputUrl} 
                  className="w-full h-full border-0"
                  title="URL Result"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-black/20 text-sm">
                  조회 결과 표시
                </div>
              )}
            </div>
          </div>

          {/* QR Result */}
          <div className="space-y-3">
            <h3 className="text-center text-sm sm:text-base font-bold opacity-60">QR전송 설정결과</h3>
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white aspect-square sm:aspect-[3/4] relative p-4 flex flex-col items-center justify-center shadow-inner text-center">
              {labQrResult ? (
                <div>
                  <div className="w-32 h-32 sm:w-48 sm:h-48 bg-black/5 rounded-xl mb-4 flex items-center justify-center mx-auto">
                    {labOutputUrl && (
                      <QRCodeSVG value={labOutputUrl} size={150} level="H" />
                    )}
                  </div>
                  <p className="text-black font-bold text-xs sm:text-sm">{labQrResult}</p>
                </div>
              ) : (
                <div className="text-black/20 text-sm">
                  결과 표시
                </div>
              )}
            </div>
          </div>

          {/* NFC Result */}
          <div className="space-y-3">
            <h3 className="text-center text-sm sm:text-base font-bold opacity-60">NFC전송 설정결과</h3>
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white aspect-square sm:aspect-[3/4] relative p-4 flex flex-col items-center justify-center shadow-inner text-center">
              {labTransferResult ? (
                <div>
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-lime/20 text-forest rounded-full mb-4 flex items-center justify-center mx-auto">
                    <CheckCircle size={40} />
                  </div>
                  <p className="text-black font-bold text-xs sm:text-sm">{labTransferResult}</p>
                </div>
              ) : (
                <div className="text-black/20 text-sm">
                  결과 표시
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
