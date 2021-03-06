#!/usr/bin/env node
var program = require('commander');
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var cwd = "src/",content = "                                                 ";
var json = require('../package');
var feature = require('../'+cwd+'feature');
var getPackageList = function(featureList){
    var temp  = ["intro"],push = Array.prototype.push,customize=[];
    var getDepencies = function(featureItem,check){
        var featureInfo = feature[featureItem],tempFeatureList=[];
        if(featureInfo) {
            if (featureInfo.dependencies) {
                featureInfo.dependencies.forEach(function (feature) {
                    push.apply(tempFeatureList,getDepencies(feature,false));
                })
            }
            if(featureItem.length>0&&tempFeatureList.indexOf(featureItem)==-1) {
                tempFeatureList.push(featureItem);
            }
        }else if(!check){
            if(featureItem.length>0&&tempFeatureList.indexOf(featureItem)==-1) {
                tempFeatureList.push(featureItem);
            }
        }
        return tempFeatureList;
    };
    if(featureList&&featureList.length>0){
        featureList.forEach(function(item){
            var list = getDepencies(item);
            push.apply(temp,getDepencies(item));
        });
    }else{
        for(var item in feature){
            push.apply(temp,getDepencies(item));
        }
    }
    temp.push("outro","comro");
    temp.forEach(function(tempFeature,index){
        tempFeature = tempFeature + ".js";
        if(customize.indexOf(tempFeature)==-1) {
            customize.push(tempFeature);
        }
    });
    if(customize.length>4) {
        return customize;
    }else{
        return getPackageList();
    }
};
program
    .version(json.version)
    .usage('build')
    .option('-p, --package [modules]', 'select the packaged module','')
    .option('-s, --src', 'package the source code')
    .option('-d, --dist [dist]', 'the distination dirctory of package','')
    .option('-r, --rename [expose]', 'rename the expose object name','')
    .option('-l, --list', 'list all supported module')

program
    .command('build')
    .description("package the mad util")
    .action(function(name){
        gutil.log('start build the '+ json.name+" ("+json.version+")");
        var srcList = getPackageList(program.package.split(","));
        var joinStr = "\n"+content.slice(0,11);
        gutil.log('build file list:', joinStr+srcList.join(joinStr));
        gulp.src(srcList,{cwd:cwd}).
            pipe(replace("@VERSION", json.version)).
            pipe(replace("@Alias", process.rename||json.shim)).
            pipe(concat(json.main)).
            pipe(gulpif(!program.src,uglify())).
            pipe(gulp.dest(program.dist||'./')).on("end",function(){
                gutil.log('build successful');
            }).on("error",function(error){
                gutil.log('build failed', error.message);
            });
    });
program.parse(process.argv);
if(program.list){
    console.log("module".concat(content).slice(0,8)+" "+"description".concat(content).slice(0,30)+" "+"apis")
    for(var key in feature){
        console.log(key.concat(content).slice(0,8)+" "+feature[key].desc.concat(content).slice(0,30)+" "+feature[key].apis.concat(content).slice(0,40));
    }
}


