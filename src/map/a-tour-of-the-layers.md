# A tour of the layers

## Questions this chapter answers

- What are the layers of an Android system, from the hardware to an app?
- What is the job of each layer, in one or two sentences?
- Which processes run on a device, and which process starts which?
- Where does each layer live on the storage of the device?
- What happens, across all layers, when you tap an app icon?

This chapter goes over the whole system once and stays at the surface. Its goal is a map. Every name you meet here gets its own chapter later. If a name is not fully clear after this chapter, that is expected. What matters is that you know which layer it belongs to and what its job is.

## The stack

The picture below shows the layers. Higher layers are built on lower ones.

```text
  +------------------------------------------------------------------+
  |  Apps                                                            |
  |  (apps you install, preinstalled apps, privileged apps)          |
  +------------------------------------------------------------------+
  |  Android framework: the classes apps are built on                |
  |  (runs inside each app process)                                  |
  +------------------------------------------------------------------+
  |  System services                                                 |
  |  (system_server, SurfaceFlinger, media services, ...)            |
  +------------------------------------------------------------------+
  |  ART, the Android runtime, and the core Java libraries           |
  +------------------------------------------------------------------+
  |  Native daemons and libraries        |  HALs                     |
  |  (init, logd, vold, Bionic, ...)     |  (camera, audio, ...)     |
  +------------------------------------------------------------------+
  ====================  system call boundary  ========================
  +------------------------------------------------------------------+
  |  Linux kernel                                                    |
  |  (generic kernel + vendor driver modules, Binder driver)         |
  +------------------------------------------------------------------+
  |  Firmware and bootloader                                         |
  +------------------------------------------------------------------+
  |  Hardware: the SoC, memory, storage, screen, radios, sensors     |
  +------------------------------------------------------------------+
```

The names of the layers above the kernel follow the official AOSP architecture page. The two bottom layers are not part of AOSP's own picture, but a book that starts at boot needs them.

Now we go through the layers from the bottom to the top.

## Hardware

The centre of a phone is the **SoC**, the System on a Chip. It holds the processor cores, the graphics processor (GPU), the modem, and many smaller parts in one package. Around the SoC are the memory, the flash storage, the screen, the cameras, the radios, and the sensors.

Almost all Android phones use processors with the **ARM 64-bit** architecture. The Android emulator on a PC often uses x86-64 instead. This book describes ARM 64-bit when the processor matters.

One hardware feature must be named early, because the security model depends on it. An ARM processor can run in two separate states, named the **normal world** and the **secure world**. This feature is named **TrustZone**. Android and all its apps run in the normal world. A second, very small operating system runs in the secure world. It is named a **Trusted Execution Environment (TEE)**. The hardware prevents the normal world from reading the memory of the secure world. So even a fully compromised Android kernel cannot directly read what the TEE holds. Android uses the TEE to keep cryptographic keys and to check the screen lock. Part X covers it.

## Firmware and bootloader

When the device gets power, the processor does not start with Android. It starts with a small program stored in read-only memory inside the SoC, named the **boot ROM**. The boot ROM loads the **bootloader** from storage. The bootloader prepares the hardware, loads the Linux kernel into memory, and jumps to it.

Each program in this chain checks the signature of the next one before it runs it. This is the start of **Verified Boot**. The idea is that every piece of code that runs was checked by a piece of code that ran before it, and the first piece cannot be changed because it is in read-only memory. Part II covers this chain.

## The Linux kernel

The kernel is the first layer that belongs to Android itself.

It does what a kernel always does. It schedules processes on the processor cores, manages memory, provides file systems, runs the network stack, and contains the drivers that talk to the hardware.

Three things about Android's kernel are worth knowing at this point.

**It is split in two.** The AOSP page says the kernel is split "into hardware-agnostic modules and vendor-specific modules". The first part is the **Generic Kernel Image (GKI)**. Google builds it, and it is the same for all devices with the same kernel version. The second part is a set of **vendor modules**. These are drivers for one specific SoC and device, built by the vendor, and loaded into the kernel at boot. This split has the same reason as Project Treble in chapter 1: Google can update the generic part without the vendor rewriting its drivers.

**It has the Binder driver.** Chapter 1 said that Binder carries calls between processes. The part that moves the data from one process to another and attaches the caller's identity is a driver inside the kernel.

**It enforces SELinux.** SELinux is a kernel feature that checks every access against a central policy. The check is added on top of the normal UID checks. Under SELinux each process has a label, named a **domain**, and each file has a label too. The policy lists which domain can do what to which label. Everything that is not in the list is refused. The important effect is that even a process running as root can only do what the policy allows for its domain.

Everything above this layer is user space. A user space process can reach the kernel only through system calls.

## HALs

A **HAL** is a Hardware Abstraction Layer. The AOSP page defines it as "an abstraction layer with a standard interface for hardware vendors to implement".

The problem it solves is this. Android's camera code must work with thousands of different cameras. So Android defines one interface for "a camera": open it, set parameters, capture a frame. Each vendor writes code that implements this interface for its own camera hardware. That code is the camera HAL. There is a HAL for each kind of hardware: audio, sensors, graphics, Bluetooth, fingerprint, and so on.

A HAL sits in user space, above the kernel driver for the same hardware. This often surprises people who know Linux, where a driver is normally the whole story. On Android, a vendor usually ships a kernel driver and a HAL together. The kernel driver does the low-level work. The HAL holds the rest of the logic and presents the standard interface. One reason is the licence: kernel code must be published under the GPL, and user space code does not have to be.

On a current device, a HAL normally runs as its own process. The AOSP documentation names this a **binderized** HAL. The framework calls it through Binder, the same mechanism apps use to call system services. The interface of each HAL is written in an interface language. Today this language is **AIDL**. An older language named **HIDL** was used from Android 8 and is now deprecated. A small, fixed set of HALs is still loaded as libraries inside the process that uses them. The graphics drivers for OpenGL and Vulkan are in this set, because a call into the GPU driver for every drawing command cannot afford to cross a process boundary.

## Native daemons and libraries

**Native** code means code compiled to machine code for the processor. It is written in C, C++, or Rust. It does not run in the virtual machine.

A **daemon** is a program that runs in the background for the whole time the system is up. Android has many native daemons. Each one has a narrow job. The most important ones are:

| Daemon | Job |
|---|---|
| `init` | The first process. Starts all other daemons, and restarts them if they die. |
| `ueventd` | Creates the device files under `/dev` when the kernel reports new hardware. |
| `servicemanager` | The directory of Binder services. A process asks it "where is the service named X" and gets back a reference to that service. |
| `logd` | Collects log messages from all processes. |
| `vold` | The volume daemon. Mounts storage and manages its encryption. |
| `netd` | Configures the network: interfaces, routes, firewall rules. |
| `installd` | Does the file work of installing an app: creates the app's data directory, starts compilation of its code. |
| `lmkd` | The low memory killer daemon. Kills processes when memory runs out. |
| `keystore2` | Keeps cryptographic keys for apps and talks to the TEE to use them. |
| `adbd` | The device side of `adb`, the debug connection to a computer. |

The native **libraries** are shared code that these daemons and all other processes load. Bionic (`libc`) is the C library. `libbinder` is the user space side of Binder. `liblog` writes log messages to `logd`. `libselinux` talks to the SELinux part of the kernel.

## ART and the core libraries

**ART**, the Android Runtime, is the virtual machine from chapter 1. The AOSP documentation describes it as "the managed runtime used by apps and some system services". It runs code in the DEX format.

ART comes with the **core libraries**. These are the basic Java classes that every Java or Kotlin program needs, such as `java.lang.String` and `java.util.HashMap`. They are based on OpenJDK.

ART is native code itself. It is a set of C++ libraries, with `libart.so` as the main one. A process "runs in ART" when it has loaded these libraries and started a virtual machine inside itself. So ART is not a separate process. Each app process has its own instance of ART inside it.

## Zygote

**Zygote** is the process that all app processes are copied from. The AOSP documentation describes it as "the root of all system and app processes".

`init` starts zygote during boot. Zygote starts ART inside itself, loads the classes and resources that every app needs, and then waits for requests on a Unix domain socket. A Unix domain socket is a channel for communication between two processes on the same machine. When a request for a new process arrives, zygote calls `fork` and the copy becomes the new process.

A modern device has one zygote, and it is 64-bit. A device that also supports 32-bit apps has two: one for 64-bit processes and one for 32-bit processes.

## System services

A **system service** is code that does privileged work for apps. The AOSP page describes system services as "modular, focused components such as `system_server`, SurfaceFlinger, and MediaService".

Most system services are written in Java and run together in one process, **`system_server`**. It is the first process that zygote forks. Some of the services inside it:

- **Activity Manager** and **Activity Task Manager** decide which app processes run and which activity is on screen.
- **Package Manager** knows every installed app, its components, and its permissions.
- **Window Manager** decides where each window is and which window gets input.
- **Power Manager**, **Alarm Manager**, **Notification Manager**, **Location Manager**, and many more.

Some system services are native daemons in their own processes. The most important one is **SurfaceFlinger**. It receives the images that each app has drawn and combines them into the final image on the screen. The audio, camera, and media services are also separate native processes.

If `system_server` crashes, the whole Android user space restarts. The kernel keeps running, but zygote and every app are killed and started again. This shows how central that one process is.

## The Android framework

The **framework** is the set of classes that apps are written against: `Activity`, `View`, `Context`, `Intent`, and thousands more. The AOSP page defines it as "a group of Java classes, interfaces, and other precompiled code upon which apps are built".

One sentence from that page corrects a common wrong picture: "Android framework code runs inside an app's process." The framework is not a separate program that apps talk to. It is a library. Zygote loads it once, and every app process inherits it through `fork`.

So the code that people loosely call "the framework" is really in two places.

1. **In each app process.** These are the framework classes the app calls directly. Many of them are thin. For example, when an app calls `LocationManager.getCurrentLocation()`, the `LocationManager` object in the app's process does almost no work. It packs the arguments and sends a Binder call.
2. **In `system_server`.** This is the service that receives the Binder call. It checks the caller's permission, talks to the location HAL, and sends the answer back.

Keeping these two halves apart in your mind makes the source code much easier to read. The first half is in `frameworks/base/core/`. The second half is in `frameworks/base/services/`.

### Three levels of API

Not all framework classes and methods are open to all apps. There are three levels.

- The **Android API** is the public interface, also named the SDK. Any app can use it.
- The **System API** is an extra set of methods marked `@SystemApi` in the source. The AOSP page says they are "available only to partners and OEMs for inclusion in bundled applications".
- Everything else is internal to the framework. These are named **non-SDK interfaces**. Normal apps are blocked from calling them, even through reflection. Reflection is the Java feature that lets code look up and call a method by its name at run time.

## Apps

At the top are the apps. The AOSP page separates three kinds, by the API level they use.

- An **Android app** uses only the Android API. Every app from an app store is of this kind.
- A **privileged app** uses the Android API and the System API. It must be preinstalled on the device in a special directory. It can hold permissions that normal apps cannot get.
- A **device manufacturer app** also has direct access to the internal framework code. It must be preinstalled, and it can only be updated together with the system software.

Some parts of what looks like "the system" are in fact apps. The status bar, the notification shade, and the lock screen are drawn by an app named **System UI**. The home screen is an app named the **launcher**. The Settings screen is an app. They are privileged apps, but they are still apps: they run in processes forked from zygote, and they reach the system through Binder like any other app.

## The same system, seen as processes

The layers are one way to see the system. A second way is to look at which processes exist and who started them. This view is often more useful, because security boundaries are between processes, not between layers.

```text
  init  (PID 1)
   |
   +-- ueventd
   +-- logd
   +-- servicemanager
   +-- vold
   +-- netd
   +-- installd
   +-- lmkd
   +-- keystore2
   +-- surfaceflinger
   +-- audio, camera, and media services
   +-- HAL processes  (one per HAL, from the vendor partition)
   +-- adbd
   |
   +-- zygote
        |
        +-- system_server
        +-- System UI
        +-- launcher
        +-- every other app process
```

Two facts stand out in this tree.

First, there are only two parents. `init` is the parent of every native daemon. Zygote is the parent of every process that runs in ART. This includes `system_server`, which is not an app, but is still Java code running in ART.

Second, the tree is not the trust order. `system_server` and a game from an app store are both children of zygote. But `system_server` runs with the system UID, 1000, and the game runs with its own app UID, 10000 or higher. Zygote sets the identity of each child right after `fork`, before any code of the app runs. It sets the UID, the groups, and the SELinux domain. After that the child cannot get them back.

## The same system, seen as storage

A third way to see the system is where each layer is stored. The flash storage is divided into **partitions**. A partition is a fixed region of the storage that holds one file system or one image. The table lists the main ones. The descriptions follow the AOSP partitions page.

| Partition | Content | Layers in it |
|---|---|---|
| `boot` | The generic kernel (GKI). | Kernel |
| `init_boot` | The generic ramdisk: a small file system kept in memory, with the first `init` program. Android 13 and higher. | First step of user space |
| `vendor_boot` | Boot code that is specific to the vendor. | Vendor kernel modules needed early |
| `system` | The Android system image. | Native daemons and libraries, framework, system apps |
| `system_ext`, `product` | Extensions of the system image, and modules specific to one product. | OEM additions to the framework, more apps |
| `vendor` | "Any binary that is vendor specific and not generic enough to distribute to AOSP." | HALs, vendor libraries |
| `odm` | Customizations of the device maker on top of the SoC vendor's code. | More HALs and configuration |
| `vendor_dlkm`, `system_dlkm` | Kernel modules. | Vendor drivers, GKI modules |
| `vbmeta` | The Verified Boot information for the other partitions. | (data for the boot chain) |
| `userdata` | "User-installed apps and data." | Installed apps, all app data |
| `metadata` | The key for metadata encryption, when the device uses it. | (data for encryption) |

The AOSP page groups these partitions by who updates them. The **system partitions** are updated when the operating system is updated. The page names `system`, `boot`, and `init_boot` as the core ones. The **vendor partitions** contain "device and hardware-specific code that might never be updated after initial release". The page names `vendor`, `vendor_boot`, and `odm` as the core ones. This is the Treble split from chapter 1, visible on the storage.

Two more points about storage.

**Only `userdata` changes during normal use.** The system and vendor partitions are mounted read-only, and Verified Boot checks their content. So a running system cannot change its own code. Everything that changes, such as installed apps and their data, is on `userdata`, and `userdata` is encrypted.

**Some system components are not files directly on `system`.** They are packed in **APEX** files. An APEX is a package that holds a small file system image with one component inside. At boot, each APEX is mounted under `/apex`. ART, for example, is at `/apex/com.android.art`. This format exists so that Google can update such a component alone, which is Project Mainline from chapter 1.

Inside the mounted partitions, a few directories appear again and again in this book:

| Path | What is there |
|---|---|
| `/system/bin` | Native programs: the daemons and command line tools. |
| `/system/lib64` | Native shared libraries. |
| `/system/framework` | The framework code. `framework.jar` is the half loaded into every app. `services.jar` is the half that runs in `system_server`. |
| `/system/app`, `/system/priv-app` | Preinstalled apps, and preinstalled privileged apps. |
| `/vendor` | HALs and vendor libraries. |
| `/apex` | The mounted APEX modules. |
| `/data/app` | The APK files of apps the user installed. |
| `/data/data` | The private data directory of each app. |

## One tap through all the layers

To connect the layers, we follow one event: the user taps the icon of an app that is not running. This is a short version. Each step is a full chapter later.

1. **Hardware and kernel.** The finger touches the screen. The touch controller raises an interrupt. The kernel driver for the touch controller reads the position and turns it into an input event. User space can read this event from a device file under `/dev/input`.

2. **`system_server`, input.** The input code inside `system_server` reads the event. It asks the Window Manager which window is at that position. The answer is the launcher's window. It sends the event to the launcher process. This channel is a socket, not Binder, because input events must be delivered with very low delay.

3. **The launcher app.** The launcher is an ordinary app. It sees that the touch is on an icon. It calls the framework method `startActivity`, with a description of what it wants to start. In the launcher's process, this method is thin. It makes a Binder call to `system_server`.

4. **Kernel, Binder.** The Binder driver moves the call from the launcher's process to `system_server`. It attaches the launcher's UID and process ID.

5. **`system_server`, Activity Task Manager and Package Manager.** The service looks up the target app in the Package Manager's data. It checks that the launcher is allowed to start it. Then it checks whether a process for the target app already exists. In our case there is none.

6. **Zygote.** `system_server` sends a request to zygote over the Unix domain socket. The request contains the UID the new process must have, its groups, its SELinux information, and more. Zygote calls `fork`. The child sets its own identity to the values from the request. From this moment it is the app's process, with the app's rights and no others.

7. **The new app process.** The child starts the main loop of an app. Its first action is a Binder call to `system_server` that says "I am alive". `system_server` answers with the instructions: which APK to load, and which activity to start.

8. **ART.** The process loads the app's code from its APK. If the code was compiled to machine code before, ART uses that. If not, ART interprets the DEX bytecode and compiles the parts that are used often. The app's own classes are created and run for the first time.

9. **Framework and GPU.** The app builds its user interface and draws it. The drawing is done by a framework library inside the app's process, with the help of the GPU, through the graphics driver. The result is an image in a memory buffer.

10. **SurfaceFlinger and the graphics HAL.** The app hands the buffer to SurfaceFlinger. SurfaceFlinger takes the buffers of all visible windows: the app, the status bar, the navigation bar. It combines them into one image, with the help of the HAL for the display hardware. The image goes to the screen at the next refresh.

In this one action, the request went through the kernel many times, crossed process boundaries with Binder and with sockets, and used a native daemon, zygote, ART, both halves of the framework, a HAL, and two apps. No single component "launches an app". The launch is a conversation between many processes, where each one does a small part and holds only the rights for that part.

## Security view

The map of layers is also a map of trust boundaries. A **trust boundary** is a place where data or a request goes from a less trusted side to a more trusted side. Each boundary is a place where a check must happen, and where a missing or wrong check becomes a security bug.

There are four main boundaries.

1. **User space to kernel: the system call interface.** Every process can make system calls. A bug in a system call or in a driver can give a process the rights of the kernel. Android reduces this surface in two ways. A **seccomp** filter limits which system calls an app process may use at all. SELinux limits which device files an app may open, and so which drivers it can reach.

2. **App to system service: Binder.** Any app can call the public methods of most system services. Each service must check the caller. This is the boundary with the largest amount of code behind it.

3. **System to vendor: the HAL interfaces.** HAL code is written by vendors, is mostly closed source, and often parses complex data such as camera frames or radio messages. Because HALs run in their own processes with their own SELinux domains, a bug in one HAL does not directly give control of `system_server`. And apps are generally not allowed to call HALs directly. They must go through a system service.

4. **Normal world to secure world: the TEE interface.** The TEE holds the most valuable secrets. Only a few processes in Android are allowed to talk to it.

Three more observations from this chapter matter for security.

**Each process has two identities.** One is the UID, from the classic Unix model. The other is the SELinux domain. Both must allow an action for it to succeed. The SELinux domain is the stronger one, because it also limits root. An app from a store runs in a domain named `untrusted_app`. `system_server` runs in a domain named `system_server`.

**Privilege goes down as you go up the stack, and exposure goes up.** The kernel has all rights and a small, filtered interface. Apps have almost no rights, and they are the place where hostile code runs. A real attack is usually a chain. It starts with code running inside one app's sandbox. It then uses a bug in a system service, a HAL, or a kernel driver to cross one boundary. It may need a second bug to cross the next one. The map in this chapter is the map of such chains.

**The identity of an app process is set by zygote, not by the app.** This is why zygote, and the request that `system_server` sends to it, are sensitive. If an attacker could change that request, they could create a process with any UID.

## Check your understanding

1. Put these in order from the lowest layer to the highest: ART, the Binder driver, the launcher, a camera HAL, `system_server`, the bootloader, Bionic.
2. A vendor ships a kernel driver and a HAL for its camera. What does each of the two do? Give one reason why the vendor does not put everything in the kernel driver.
3. "The framework is a process that apps send requests to." What is wrong with this sentence? Where does framework code really run?
4. Which two processes are the parents of almost all other processes on a device? Which kind of process does each one start?
5. `system_server` and a game are both forked from zygote. Why do they not have the same rights? At which moment are the rights set, and by which process?
6. During normal use, which partition changes and which do not? Why is this useful for security?
7. In the tap example, the request to create the new process does not go through Binder. Which channel does it use, and between which two processes?
8. In the tap example, list every point where the request crosses from one process to another.
9. A process runs as root. Can it do anything it wants on an Android device? Explain.
10. Name the four trust boundaries in this chapter. For each one, name which side is less trusted.

## Sources

Pages read for this chapter:

- Architecture overview: <https://source.android.com/docs/core/architecture>
- Partitions overview: <https://source.android.com/docs/core/architecture/partitions>
- HAL overview: <https://source.android.com/docs/core/architecture/hal>
- HIDL overview: <https://source.android.com/docs/core/architecture/hidl>
- Zygote: <https://source.android.com/docs/core/runtime/zygote>
- ART overview: <https://source.android.com/docs/core/runtime>

Places in the source tree for the components named here:

- `system/core/init/`: `init` and `ueventd`.
- `frameworks/native/cmds/servicemanager/`: `servicemanager`.
- `frameworks/base/core/java/com/android/internal/os/ZygoteInit.java`: the start of zygote.
- `frameworks/base/services/java/com/android/server/SystemServer.java`: the start of `system_server`.
- `frameworks/base/core/java/android/app/ActivityThread.java`: the main loop of an app process.
- `frameworks/native/services/surfaceflinger/`: SurfaceFlinger.
- `frameworks/native/services/inputflinger/`: the input code that runs in `system_server`.
- `art/`: ART.

Notes on what is not yet checked against a source:

- The two official pages disagree on when HIDL was deprecated. The HAL page says Android 13. The HIDL page says Android 10. This chapter only says that HIDL is deprecated. The HAL chapter will settle the version.
- The steps of the tap example are written from general knowledge of the system, and the official pages above do not describe them in this form. Each step will be checked against the source code in the chapter that covers it.
