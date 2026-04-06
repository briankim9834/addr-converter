// types/address.ts

/** 카카오 우편번호 위젯 oncomplete 콜백 데이터 */
export interface KakaoAddressData {
  roadAddress: string      // 도로명주소: "서울 강남구 테헤란로 152"
  jibunAddress: string     // 지번주소: "서울 강남구 역삼동 737"
  zonecode: string         // 우편번호: "06142"
  addressType: 'R' | 'J'  // R: 도로명, J: 지번
  buildingName: string     // 건물명: "강남파이낸스센터"
  bname: string            // 법정동명
}

/** JUSO API 응답의 개별 주소 항목 */
export interface JusoItem {
  roadAddr: string     // 한글 도로명주소
  engAddr: string      // 영문 도로명주소 (전체) — kept for reference
  zipNo: string        // 우편번호
  siNm: string         // 시도명 (영문) e.g., "Seoul"
  sggNm: string        // 시군구명 (영문) e.g., "Gangnam-gu"
  rn: string           // 도로명 (영문) e.g., "Teheran-ro"
  buldMnnm: string     // 건물본번 e.g., "152"
  buldSlno: string     // 건물부번 e.g., "0"
}

/** JUSO API 전체 응답 구조 */
export interface JusoApiResponse {
  results: {
    common: {
      errorCode: string
      errorMessage: string
      totalCount: string
    }
    juso: JusoItem[] | null
  }
}

/** 변환 결과 — 화면에 표시되는 구조화된 영문 주소 */
export interface ParsedAddress {
  addressLine1: string     // "152 Teheran-ro, Gangnam-gu"
  addressLine2: string     // Papago 번역된 상세주소 (편집 가능)
  city: string             // "Seoul"
  state: string            // "Seoul" (도 단위면 "Gyeonggi-do")
  zipCode: string          // "06142"
  country: string          // "South Korea" (고정)
  fullAddress: string      // 전체 한 줄 조합
}

/** 카카오에서 선택된 주소 상태 */
export interface SelectedAddress {
  korean: string           // 카카오에서 선택한 한글 도로명 주소
  zonecode: string         // 우편번호
}
