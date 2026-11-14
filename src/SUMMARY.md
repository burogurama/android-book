# Summary

[About this book](preface.md)

# Part I: The map

- [What Android is](map/what-android-is.md)
- [A tour of the layers]()
- [The source tree and the build]()

# Part II: Hardware and boot

- [The hardware under Android]()
- [Boot ROM and the bootloader chain]()
- [Partitions and images]()
- [Verified Boot]()
- [From kernel start to the first process]()

# Part III: The Linux kernel as Android uses it

- [Android kernels: ACK, GKI, and vendor modules]()
- [Processes, threads, and scheduling]()
- [Memory management]()
- [Low memory: PSI and lmkd]()
- [File systems and storage]()
- [Power management and suspend]()
- [Kernel security features]()
- [eBPF on Android]()

# Part IV: Native user space

- [init and the boot sequence in user space]()
- [System properties]()
- [Bionic: the C library]()
- [The dynamic linker and linker namespaces]()
- [Logging, crashes, and tombstones]()
- [adb and the debug bridge]()

# Part V: Binder

- [Why Binder exists]()
- [The Binder object model]()
- [The Binder driver]()
- [libbinder and Parcel]()
- [servicemanager and service lookup]()
- [AIDL]()
- [Binder and security]()

# Part VI: The shape of the system

- [Project Treble: the system and vendor split]()
- [HALs: HIDL and AIDL]()
- [APEX and Mainline modules]()
- [The core native daemons]()
- [System updates: OTA, A/B, and Virtual A/B]()

# Part VII: ART, the virtual machine

- [From Java and Kotlin source to DEX]()
- [The DEX file format]()
- [Dalvik bytecode]()
- [Inside the ART runtime]()
- [Class loading, linking, and verification]()
- [The interpreter]()
- [The JIT compiler]()
- [Ahead-of-time compilation: dex2oat, OAT, VDEX]()
- [Profiles and the boot image]()
- [Memory layout and garbage collection]()
- [JNI and native code]()
- [Threads, monitors, and signals]()
- [Zygote]()
- [Non-SDK interface restrictions]()
- [Debugging and instrumentation: JDWP and JVMTI]()

# Part VIII: The framework

- [system_server]()
- [Activity Manager: processes and their priority]()
- [Activities, tasks, and the lifecycle]()
- [Services, broadcasts, and content providers]()
- [Package Manager]()
- [The graphics stack: from a view to a pixel]()
- [Window Manager and SurfaceFlinger]()
- [Input]()
- [Power, alarms, and background limits]()
- [Storage: vold, StorageManager, and scoped storage]()
- [Networking]()
- [Users and profiles]()

# Part IX: Applications

- [The APK format]()
- [The manifest and binary XML]()
- [Resources and assets]()
- [APK signing]()
- [Installing an app]()
- [Starting an app process]()
- [The main thread: Looper, Handler, MessageQueue]()
- [Native libraries in apps]()
- [WebView]()
- [Process death and saved state]()

# Part X: The security model

- [The security model as a whole]()
- [The app sandbox]()
- [SELinux on Android]()
- [Permissions and app ops]()
- [Keystore, KeyMint, and StrongBox]()
- [Authentication: Gatekeeper, biometrics, Weaver]()
- [Encryption: file-based and metadata]()
- [TrustZone and trusted execution]()
- [Virtualization: pKVM and Microdroid]()
- [Exploit mitigations]()
- [The attack surface, layer by layer]()

---

[Glossary](glossary.md)
