# Glossary

Terms are added here when a chapter first explains them.

**AIDL** (Android Interface Definition Language). The language used to describe an interface that is called through Binder. It is used for system services and for HALs.

**AOSP** (Android Open Source Project). The public source code of Android, and the project that publishes it. See [What Android is](map/what-android-is.md).

**APEX**. A package format for a system component. It holds a small file system image, which is mounted under `/apex` at boot. It lets one component be updated alone.

**API level**. A whole number that names one version of the interface Android gives to apps. It goes up by one with each release that changes that interface. See [What Android is](map/what-android-is.md).

**ART** (Android Runtime). The virtual machine that runs app code on Android. It replaced the older Dalvik virtual machine in Android 5.0.

**Binder**. Android's mechanism for one process to call a function in another process. It has a part inside the kernel (the Binder driver) and a part in user space.

**Binderized HAL**. A HAL that runs in its own process and is called through Binder.

**Bionic**. Android's C library. It does the job that glibc does on a desktop Linux system.

**Boot ROM**. The first program the processor runs after power on. It is stored in read-only memory inside the SoC and cannot be changed.

**Bootloader**. The program that the boot ROM loads. It prepares the hardware, loads the kernel, and starts it.

**CDD** (Compatibility Definition Document). The document that lists what a device must do to be called compatible with Android.

**CTS** (Compatibility Test Suite). The set of automatic tests that checks a device against the CDD.

**Daemon**. A program that runs in the background for the whole time the system is up.

**DEX** (Dalvik Executable). The file format that holds compiled app code. ART runs DEX code.

**Domain** (SELinux). The label that SELinux gives to a process. The SELinux policy says what each domain is allowed to do.

**GKI** (Generic Kernel Image). The part of the kernel that Google builds and that is the same for all devices with the same kernel version.

**GMS** (Google Mobile Services). Google's closed-source apps and services, such as Google Play Store and Google Play services. They are not part of AOSP.

**HAL** (Hardware Abstraction Layer). A piece of code, written by the hardware maker, that sits between Android and one kind of hardware and gives Android a standard interface to it.

**HIDL** (HAL Interface Definition Language). The older language for describing HAL interfaces, used from Android 8. It is deprecated, and AIDL replaces it.

**Launcher**. The app that draws the home screen and starts other apps when the user taps their icons.

**Native code**. Code compiled to machine code for the processor, written in C, C++, or Rust. It does not run in the virtual machine.

**Non-SDK interface**. A class or method inside the framework that is not part of the public Android API. Normal apps are blocked from using it.

**OEM** (Original Equipment Manufacturer). The company that makes and sells the device, for example Samsung or Xiaomi.

**Partition**. A fixed region of the storage that holds one file system or one image.

**seccomp**. A kernel feature that limits which system calls a process may use.

**SELinux**. A kernel feature that checks every access against a central policy, on top of the normal UID checks. It also limits processes that run as root.

**servicemanager**. The daemon that keeps the directory of Binder services. A process asks it for a service by name.

**SoC** (System on a Chip). The main chip of a phone. It holds the processor cores, the graphics processor, the modem, and more in one package.

**SurfaceFlinger**. The system service that combines the images drawn by all apps into the final image on the screen.

**System API**. Framework methods marked `@SystemApi`. Only preinstalled privileged apps can use them.

**system_server**. The process that hosts most of Android's system services.

**System UI**. The privileged app that draws the status bar, the notification shade, and the lock screen.

**TEE** (Trusted Execution Environment). A small operating system that runs in the secure world of the processor, beside Android. It keeps keys and other secrets.

**Trust boundary**. A place where data or a request goes from a less trusted side to a more trusted side, so a check must happen there.

**TrustZone**. The ARM processor feature that provides two separate states, the normal world and the secure world.

**UID** (user ID). The number the Linux kernel uses to identify a user. Android gives each app its own UID.

**Verified Boot**. The chain of checks at boot, where each program checks the signature of the next one before running it.

**Zygote**. The process that every app process is copied from.
