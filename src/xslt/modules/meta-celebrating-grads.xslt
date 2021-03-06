<?xml version="1.0" encoding="UTF-8"?>

<!--
@Author: Colin Osterhout <ctosterhout>
@Date:   2016-04-29T18:47:25-08:00
@Email:  ctosterhout@alaska.edu
@Project: BERT
@Last modified by:   ctosterhout
@Last modified time: 2016-06-01T23:14:02-08:00
@License: Released under MIT License. Copyright 2016 University of Alaska Southeast.  For more details, see https://opensource.org/licenses/MIT
-->

<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xd="http://www.pnp-software.com/XSLTdoc"
    exclude-result-prefixes="xd"
    >

    <xsl:import href="../include/pathfilter.xslt"/>
    <xsl:import href="meta.xslt"/>

    <xd:doc type="stylesheet">
        <xd:short>Creates full thumbnail image URL for the celebrating-grads data definition.</xd:short>
        <xd:author>Colin Osterhout (ctosterhout@alaska.edu)</xd:author>
        <xd:copyright>University of Alaska Southeast, 2016</xd:copyright>
    </xd:doc>
    <xsl:output indent="yes" method="html" omit-xml-declaration='yes'/>

    <!-- Return full thumbnail path for the celebrating grads type -->
    <xsl:template match="system-data-structure[@definition-path='celebrating-grads'][file-image[@type='file']]" mode="meta-thumbnail">
        <xsl:variable name="sPathFiltered">
            <xsl:call-template name="pathfilter">
                <xsl:with-param name="path" select="file-image/path"/>
            </xsl:call-template>
        </xsl:variable>

        <xsl:value-of select="concat($sUrlBase, $sPathFiltered)"/>
    </xsl:template>
</xsl:stylesheet>
