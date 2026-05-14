import { motion, AnimatePresence } from 'framer-motion';
import { Download, Search, Trash2, Edit2 } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';

interface NFCTag {
  id: string;
  nfc_id: string;
  authorized_mac: string;
  pc_name: string;
  status: 'active' | 'inactive';
  last_login: string;
  po_number: string;
  department: string;
  assigned_user: string;
  updated_at: string;
}

interface AdminNFCTagsProps {
  showAlert: (message: string) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
}

export default function AdminNFCTags({ showAlert, showConfirm }: AdminNFCTagsProps) {
  const [nfcTagsData, setNFCTagsData] = useState<NFCTag[]>([]);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('전체');
  const [selectedTag, setSelectedTag] = useState<NFCTag | null>(null);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState({
    nfc_id: '',
    authorized_mac: '',
    pc_name: '',
    status: 'active' as const,
    last_login: '',
    po_number: '',
    department: '',
    assigned_user: ''
  });

  useEffect(() => {
    const path = 'config_desks';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const tags: NFCTag[] = [];
      snapshot.forEach((doc) => {
        tags.push({ id: doc.id, ...doc.data() } as NFCTag);
      });
      setNFCTagsData(tags.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, []);

  const filteredTags = useMemo(() => {
    return nfcTagsData.filter(tag => {
      const searchMatch = 
        tag.nfc_id.toLowerCase().includes(filterSearch.toLowerCase()) ||
        tag.pc_name.toLowerCase().includes(filterSearch.toLowerCase()) ||
        tag.authorized_mac.toLowerCase().includes(filterSearch.toLowerCase()) ||
        tag.assigned_user.toLowerCase().includes(filterSearch.toLowerCase());
      const statusMatch = filterStatus === '전체' || tag.status === filterStatus;
      return searchMatch && statusMatch;
    });
  }, [nfcTagsData, filterSearch, filterStatus]);

  const getIPAddress = async () => {
    try {
      // 1. IP 주소 가져오기
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      const publicIP = data.ip;

      // 2. PO 번호에 IP 입력
      setNewTag(prev => ({ ...prev, po_number: publicIP }));

      showAlert(`IP 정보 동기화 완료!\n\n확인된 IP: ${publicIP}\n(PO 번호 필드에 자동으로 입력되었습니다)`);
    } catch (error) {
      showAlert('IP 정보를 가져오는 중 오류가 발생했습니다. 수동으로 입력해주세요.');
    }
  };

  const handleNfcIdChange = (value: string) => {
    // 영문, 숫자, 하이픈, 언더바만 허용하고 대문자로 변환
    const sanitized = value.replace(/[^a-zA-Z0-9\-_]/g, '').toUpperCase();
    setNewTag({ ...newTag, nfc_id: sanitized });
  };

  const handleAddTag = async () => {
    if (!newTag.nfc_id || !newTag.pc_name) {
      showAlert('필수 항목(NFC ID, PC 관리명)을 입력해주세요.');
      return;
    }

    try {
      // 중복 체크
      const docRef = doc(db, 'config_desks', newTag.nfc_id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        showAlert(`이미 등록된 NFC ID(${newTag.nfc_id})입니다.\n다른 값을 입력해주세요.`);
        return;
      }

      await setDoc(docRef, {
        ...newTag,
        updated_at: new Date().toISOString()
      });
      setNewTag({
        nfc_id: '',
        authorized_mac: '',
        pc_name: '',
        status: 'active',
        last_login: '',
        po_number: '',
        department: '',
        assigned_user: ''
      });
      setIsAddingTag(false);
      showAlert('NFC 태그가 추가되었습니다.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'config_desks');
    }
  };

  const handleUpdateTag = async () => {
    if (!selectedTag) return;
    
    try {
      const { id, ...updateData } = selectedTag;
      const path = `config_desks/${id}`;
      
      await updateDoc(doc(db, 'config_desks', id), {
        ...updateData,
        updated_at: new Date().toISOString()
      });
      
      setSelectedTag(null);
      showAlert('NFC 태그 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `config_desks/${selectedTag.id}`);
    }
  };
  const handleDeleteTag = (tag: NFCTag) => {
    const path = `config_desks/${tag.id}`;
    showConfirm(`"${tag.pc_name}" 태그를 삭제하시겠습니까?`, async () => {
      try {
        await deleteDoc(doc(db, 'config_desks', tag.id));
        showAlert('NFC 태그가 삭제되었습니다.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    });
  };

  const exportToExcel = () => {
    const data = filteredTags.map((tag, index) => ({
      '순번': index + 1,
      'NFC ID': tag.nfc_id,
      '인증된 PC MAC 주소': tag.authorized_mac,
      'PC 관리명': tag.pc_name,
      '상태': tag.status,
      '마지막 접속': tag.last_login,
      'PO 번호': tag.po_number,
      '부서': tag.department,
      '담당자': tag.assigned_user,
      '최종 수정 시간': tag.updated_at
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'NFC Tags');
    XLSX.writeFile(wb, `NFC태그_${new Date().toISOString().split('T')[0]}.xlsx`);
    showAlert('엑셀 파일이 다운로드되었습니다.');
  };

  return (
    <motion.div
      key="nfcTags"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl serif italic">NFC 태그 관리</h2>
        <button 
          onClick={exportToExcel}
          className="w-full sm:w-auto bg-lime text-forest px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] transition-all"
        >
          <Download size={18} /> 엑셀 내보내기
        </button>
      </div>

      {/* 필터 및 검색 */}
      <div className="glass rounded-[32px] sm:rounded-[40px] border border-white/10 p-4 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          <div className="flex-1">
            <label className="text-[10px] sm:text-xs tracking-widest uppercase opacity-40 block mb-2 sm:mb-3">검색</label>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                placeholder="NFC ID, PC명 등..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-lime/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>
          <div className="w-full md:w-40">
            <label className="text-[10px] sm:text-xs tracking-widest uppercase opacity-40 block mb-2 sm:mb-3">상태</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-forest border border-white/20 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime/50 transition-all cursor-pointer"
            >
              <option className="bg-forest text-white">전체</option>
              <option className="bg-forest text-white">active</option>
              <option className="bg-forest text-white">inactive</option>
            </select>
          </div>
        </div>

        {/* 추가 버튼 */}
        <button
          onClick={() => setIsAddingTag(!isAddingTag)}
          className="w-full sm:w-auto bg-lime text-forest px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all"
        >
          {isAddingTag ? '취소' : '+ NFC 태그 추가'}
        </button>

        {/* 추가 폼 */}
        {isAddingTag && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 pt-4 border-t border-white/10 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={getIPAddress}
                className="bg-blue-500/30 text-blue-200 hover:bg-blue-500/50 border border-blue-500/50 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
              >
                IP 정보 가져오기
              </button>
              <p className="text-[10px] sm:text-xs opacity-60 flex items-center">현재 PC의 공인 IP 정보를 확인합니다</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="NFC ID (필수)"
                value={newTag.nfc_id}
                onChange={(e) => handleNfcIdChange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime/50"
              />
              <input
                type="text"
                placeholder="PC 관리명 (필수)"
                value={newTag.pc_name}
                onChange={(e) => setNewTag({ ...newTag, pc_name: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime/50"
              />
              <input
                type="text"
                placeholder="MAC 주소"
                value={newTag.authorized_mac}
                onChange={(e) => setNewTag({ ...newTag, authorized_mac: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime/50"
              />
              <select
                value={newTag.status}
                onChange={(e) => setNewTag({ ...newTag, status: e.target.value as any })}
                className="bg-forest border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime/50 cursor-pointer"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <button
              onClick={handleAddTag}
              className="w-full bg-lime text-forest px-4 py-3 rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all mt-4"
            >
              저장
            </button>
          </motion.div>
        )}
      </div>

      {/* 테이블/카드 뷰 */}
      <div className="glass rounded-[32px] sm:rounded-[40px] border border-white/10 overflow-hidden flex flex-col flex-1">
        {/* Mobile Card List */}
        <div className="sm:hidden overflow-y-auto max-h-[70vh] p-4 space-y-4 custom-scrollbar">
          {filteredTags.map((tag) => (
            <div 
              key={tag.id}
              onClick={() => setSelectedTag(tag)}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 relative active:scale-[0.98] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] tracking-widest uppercase opacity-40 font-bold">NFC ID</p>
                  <h4 className="font-bold text-white text-base">{tag.nfc_id}</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  tag.status === 'active' ? 'bg-lime text-forest' : 'bg-white/20 text-white'
                }`}>
                  {tag.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] tracking-widest uppercase opacity-40 font-bold">PC 관리명</p>
                  <p className="text-sm font-medium text-white/80">{tag.pc_name || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] tracking-widest uppercase opacity-40 font-bold">담당자</p>
                  <p className="text-sm font-medium text-white/80">{tag.assigned_user || '-'}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                   <p className="text-[10px] text-white/40 font-medium">마지막 접속: {tag.last_login || '없음'}</p>
                 </div>
                 <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTag(tag);
                    }}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
            </div>
          ))}
          {filteredTags.length === 0 && (
            <div className="py-20 text-center opacity-40 serif italic">
              검색 결과가 없습니다.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto overflow-y-auto flex-1 custom-scrollbar max-h-[70vh]">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-white/10 text-[10px] tracking-widest uppercase opacity-40 sticky top-0 bg-[#1a2e1a] z-10">
                <th className="p-4 font-medium w-12">순번</th>
                <th className="p-4 font-medium w-32">NFC ID</th>
                <th className="p-4 font-medium w-40">인증된 PC MAC</th>
                <th className="p-4 font-medium w-32">PC 관리명</th>
                <th className="p-4 font-medium w-24 text-center">상태</th>
                <th className="p-4 font-medium w-32 text-center">마지막 접속</th>
                <th className="p-4 font-medium w-32 text-center">PO 번호</th>
                <th className="p-4 font-medium w-32 text-center">부서</th>
                <th className="p-4 font-medium w-32 text-center">담당자</th>
                <th className="p-4 font-medium w-16 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {filteredTags.map((tag, index) => (
                <tr 
                  key={tag.id}
                  onClick={() => setSelectedTag(tag)}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="p-4 opacity-40">{index + 1}</td>
                  <td className="p-4 font-medium truncate" title={tag.nfc_id}>{tag.nfc_id}</td>
                  <td className="p-4 opacity-60 truncate" title={tag.authorized_mac}>{tag.authorized_mac}</td>
                  <td className="p-4 font-medium truncate" title={tag.pc_name}>{tag.pc_name}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-block w-full text-center ${
                      tag.status === 'active' ? 'bg-lime text-forest' :
                      'bg-white/20 text-white'
                    }`}>
                      {tag.status}
                    </span>
                  </td>
                  <td className="p-4 opacity-60 truncate text-center" title={tag.last_login}>{tag.last_login}</td>
                  <td className="p-4 opacity-60 truncate text-center" title={tag.po_number}>{tag.po_number}</td>
                  <td className="p-4 opacity-60 truncate text-center" title={tag.department}>{tag.department}</td>
                  <td className="p-4 opacity-60 truncate text-center" title={tag.assigned_user}>{tag.assigned_user}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTag(tag);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors inline-flex"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTags.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-20 text-center opacity-40 serif italic">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 상세 팝업 */}
      <AnimatePresence>
        {selectedTag && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedTag(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass rounded-[40px] border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl serif italic">NFC 태그 수정</h2>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[10px] tracking-widest uppercase opacity-40">
                  <Edit2 size={12} /> Editing Mode
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs tracking-widest uppercase opacity-40 block mb-2">NFC ID (수정 불가)</label>
                    <input
                      type="text"
                      value={selectedTag.nfc_id}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm opacity-50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase opacity-40 block mb-2">PC 관리명</label>
                    <input
                      type="text"
                      value={selectedTag.pc_name}
                      lang="ko"
                      onChange={(e) => setSelectedTag({ ...selectedTag, pc_name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-lime/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase opacity-40 block mb-2">인증된 PC MAC</label>
                    <input
                      type="text"
                      value={selectedTag.authorized_mac}
                      onChange={(e) => setSelectedTag({ ...selectedTag, authorized_mac: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-lime/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase opacity-40 block mb-2">상태</label>
                    <select
                      value={selectedTag.status}
                      onChange={(e) => setSelectedTag({ ...selectedTag, status: e.target.value as any })}
                      className="w-full bg-forest border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-lime/50 cursor-pointer"
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase opacity-40 block mb-2">마지막 접속</label>
                    <input
                      type="text"
                      value={selectedTag.last_login}
                      onChange={(e) => setSelectedTag({ ...selectedTag, last_login: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-lime/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase opacity-40 block mb-2">PO 번호 (수정 불가)</label>
                    <input
                      type="text"
                      value={selectedTag.po_number}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm opacity-50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase opacity-40 block mb-2">부서</label>
                    <input
                      type="text"
                      value={selectedTag.department}
                      onChange={(e) => setSelectedTag({ ...selectedTag, department: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-lime/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs tracking-widest uppercase opacity-40 block mb-2">담당자</label>
                    <input
                      type="text"
                      value={selectedTag.assigned_user}
                      onChange={(e) => setSelectedTag({ ...selectedTag, assigned_user: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-lime/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs tracking-widest uppercase opacity-40 block mb-2">최종 수정 시간 (자동 업데이트)</label>
                  <p className="text-sm opacity-60">{selectedTag.updated_at}</p>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setSelectedTag(null)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-full transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateTag}
                  className="bg-lime text-forest px-8 py-3 rounded-full font-bold hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] transition-all"
                >
                  저장하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
