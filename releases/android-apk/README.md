# Android APK Archive

| File | Build status | Contents | SHA-256 |
| --- | --- | --- | --- |
| `Arabmonopoly-Driver-v3.apk` | Finished EAS Android preview build | Driver trips, delivery proof, foreground location sharing | `10E8F0FDC00823FFE5021EB54CFDEAB5F54F4D1F02A7036DADD6EDDCC70D9242` |
| `Arabmonopoly-Driver-v4.apk` | Finished EAS build `e38ab86b-db99-4c8f-82ef-80cf61ecf740` | Driver fuel entry with required fuel-pump photo | `0A7EAABF22047F3217192868ED189558300E3CF2BF34EE7EF5EE90D765A104AE` |

Version 5 has background location tracking source changes and requires a new EAS Android build before an APK can be added here.

Verify an APK after copying it with:

```powershell
Get-FileHash .\Arabmonopoly-Driver-v4.apk -Algorithm SHA256
```