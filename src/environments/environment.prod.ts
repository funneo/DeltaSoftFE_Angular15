export const environment = {
  apiReportUrl: 'http://125.212.225.178:8090',
  //apiUrl: 'http://125.212.225.178:8060',
  apiUrl: 'http://115.84.178.66:8060',
  //apiUrl: 'https://115.84.178.66:8443',
  apiXuong: 'https://v2.delta-repair.com/api/v1',
  // S3 public-read bucket (no presign) — ghép key PathFileS3 để xem file mọi nơi, không phụ thuộc server local.
  s3BaseUrl: 'https://files-manager-delta-erp.s3.ap-southeast-1.amazonaws.com/',
  production: true,
  transportGroupId: 14,
  parkingFeeId: 665,
  tollFeeId: 659,
  fuelFeeId: 666,
  subContractFee: 677,
  firebase: {
    apiKey: "AIzaSyCGzuqIA9cNF1vpjAOHpkWlK-iRyNgiThk",
    authDomain: "delta-erp-vn.firebaseapp.com",
    projectId: "delta-erp-vn",
    storageBucket: "delta-erp-vn.firebasestorage.app",
    messagingSenderId: "539641410586",
    appId: "1:539641410586:web:384c9c77956e3f475a8da3",
    measurementId: "G-BQ48ZRL93F"
  },
  googleMap_ApiKey: "AIzaSyAveE6Nxm9r369YSuOaFALrso7pFlKofHs"
};
