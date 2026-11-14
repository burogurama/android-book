# Glossary

Terms are added here when a chapter first explains them.

**AOSP** (Android Open Source Project). The public source code of Android, and the project that publishes it. See [What Android is](map/what-android-is.md).

**API level**. A whole number that names one version of the interface Android gives to apps. It goes up by one with each release that changes that interface. See [What Android is](map/what-android-is.md).

**ART** (Android Runtime). The virtual machine that runs app code on Android. It replaced the older Dalvik virtual machine in Android 5.0.

**Binder**. Android's mechanism for one process to call a function in another process. It has a part inside the kernel (the Binder driver) and a part in user space.

**Bionic**. Android's C library. It does the job that glibc does on a desktop Linux system.

**CDD** (Compatibility Definition Document). The document that lists what a device must do to be called compatible with Android.

**CTS** (Compatibility Test Suite). The set of automatic tests that checks a device against the CDD.

**DEX** (Dalvik Executable). The file format that holds compiled app code. ART runs DEX code.

**GMS** (Google Mobile Services). Google's closed-source apps and services, such as Google Play Store and Google Play services. They are not part of AOSP.

**HAL** (Hardware Abstraction Layer). A piece of code, written by the hardware maker, that sits between Android and one kind of hardware and gives Android a standard interface to it.

**OEM** (Original Equipment Manufacturer). The company that makes and sells the device, for example Samsung or Xiaomi.

**SoC** (System on a Chip). The main chip of a phone. It holds the processor cores, the graphics processor, the modem, and more in one package.

**system_server**. The process that hosts most of Android's system services.

**UID** (user ID). The number the Linux kernel uses to identify a user. Android gives each app its own UID.

**Zygote**. The process that every app process is copied from.
