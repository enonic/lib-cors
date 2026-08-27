import com.github.gradle.node.pnpm.task.PnpmTask

plugins {
    java
    `maven-publish`
    id("com.enonic.xp.base")
    alias(libs.plugins.enonic.defaults)
    alias(libs.plugins.node.gradle)
}

xp {
    scriptEngines = listOf("Nashorn", "GraalJS")
}

repositories {
    mavenLocal()
    mavenCentral()
    xp.enonicRepo()
}

dependencies {
    compileOnly(xplibs.api.script)

    testImplementation(platform(libs.junit.bom))
    testImplementation(platform(libs.mockito.bom))
    testImplementation(xplibs.testing)
    testImplementation("org.junit.jupiter:junit-jupiter")
    testImplementation("org.mockito:mockito-junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

node {
    download = true
    version = "24.19.0"
    pnpmVersion = "11.23.0"
}

val environmentShort = if (providers.gradleProperty("env").orNull == "dev") "dev" else "prod"
val nodeEnvironment = if (environmentShort == "dev") "development" else "production"

fun pnpmCheck(taskName: String, script: String) =
    tasks.register<PnpmTask>(taskName) {
        dependsOn(tasks.named("pnpmInstall"))
        args = listOf("run", script)
        environment = mapOf("FORCE_COLOR" to "true")
    }

pnpmCheck("checkTypes", "check:types")
pnpmCheck("checkLint", "check:lint")
pnpmCheck("pnpmTest", "test")

val esbuildOutput = layout.buildDirectory.dir("esbuild")

val pnpmBuild = tasks.register<PnpmTask>("pnpmBuild") {
    dependsOn(tasks.named("pnpmInstall"))
    args = listOf("run", "build:$environmentShort")
    environment = mapOf("FORCE_COLOR" to "true", "NODE_ENV" to nodeEnvironment)
    inputs.dir("src/main/resources")
    inputs.file("esbuild.config.js")
    inputs.file("package.json")
    inputs.file("pnpm-lock.yaml")
    inputs.file("tsconfig.json")
    outputs.dir(esbuildOutput)
    // esbuild never prunes outdir, so a removed entry point would keep shipping until the next clean
    val staleOutput = esbuildOutput.get().asFile
    doFirst { staleOutput.deleteRecursively() }
}

tasks.named<ProcessResources>("processResources") {
    exclude("**/*.ts")
    includeEmptyDirs = false
    from(pnpmBuild)
}

tasks.named("check") {
    dependsOn("checkTypes", "checkLint", "pnpmTest")
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}
