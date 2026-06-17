---
layout: home
hero:
  name: Ordo
  text: C/C++のためのプロジェクトオーケストレーター
  tagline: Cargoライクな開発体験をC/C++に。もうCMakeLists.txtは要りません。
  actions:
    - theme: brand
      text: はじめる
      link: /ja/guide/getting-started
    - theme: alt
      text: GitHub で見る
      link: https://github.com/NaruseNia/ordo
features:
  - icon: ⚡
    title: Cargoライクなワークフロー
    details: "ordo new → ordo add → ordo build → ordo run。シンプルなコマンドで、ビルドシステムのボイラープレートは不要です。"
  - icon: 📦
    title: 統一された依存管理
    details: vcpkg、Conan、pkg-config、system、git — 5つのプロバイダを1つのインターフェースで扱えます。
  - icon: 🔒
    title: 再現性のあるビルド
    details: Ordo.lockがすべての依存をハッシュ付きで固定します。同じ入力からは常に同じ結果が得られます。
  - icon: 🏗️
    title: ワークスペース
    details: モノレポをネイティブにサポート。依存の共有、ツールチェインの統一、全メンバーで1つのbuild.ninja。
  - icon: 🔧
    title: Ninja直接生成
    details: CMakeを経由しません。Ordoはbuild.ninjaを直接生成し、ビルドの透明性を最大化します。
  - icon: 🌙
    title: Luaビルドスクリプト
    details: サンドボックス化されたLuaスクリプトでgit依存をビルド。暗黙の実行はありません。
---
