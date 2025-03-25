/**
 * Model shortcode templates to use for replacements
 */

module.exports = {
  // Self-closing shortcodes
  statsHighlightTemplate: `{{< data-modules/stats-highlight title="KEY_TITLE" columns="3" />}}
{{< data-modules/stat-card value="STAT_1_VALUE" label="STAT_1_LABEL" color="blue" >}}
  STAT_1_CONTENT
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="STAT_2_VALUE" label="STAT_2_LABEL" color="green" >}}
  STAT_2_CONTENT
{{< /data-modules/stat-card >}}

{{< data-modules/stat-card value="STAT_3_VALUE" label="STAT_3_LABEL" color="purple" >}}
  STAT_3_CONTENT
{{< /data-modules/stat-card >}}`,

  // Resource links
  resourceLinksTemplate: `{{< interactive-modules/resource-links title="Additional Resources" columns="2" >}}
{{< interactive-modules/resource-card title="RESOURCE_1_TITLE" url="RESOURCE_1_URL" type="tool" >}}
  RESOURCE_1_CONTENT
{{< /interactive-modules/resource-card >}}

{{< interactive-modules/resource-card title="RESOURCE_2_TITLE" url="RESOURCE_2_URL" type="service" >}}
  RESOURCE_2_CONTENT
{{< /interactive-modules/resource-card >}}
{{< /interactive-modules/resource-links >}}`,

  // Price table with HTML rows
  priceTableTemplate: `{{< data-modules/price-table title="PRICE_TABLE_TITLE" description="PRICE_TABLE_DESCRIPTION" >}}
  <tr>
    <td>ITEM_1</td>
    <td>PRICE_1</td>
    <td>NOTES_1</td>
  </tr>
  <tr>
    <td>ITEM_2</td>
    <td>PRICE_2</td>
    <td>NOTES_2</td>
  </tr>
{{< /data-modules/price-table >}}`,

  // Auction results with HTML rows
  auctionResultsTemplate: `{{< auction-results title="AUCTION_TITLE" description="AUCTION_DESCRIPTION" >}}
  <tr>
    <td>ITEM_1</td>
    <td>PRICE_1</td>
    <td>DATE_1</td>
    <td>AUCTION_HOUSE_1</td>
  </tr>
  <tr>
    <td>ITEM_2</td>
    <td>PRICE_2</td>
    <td>DATE_2</td>
    <td>AUCTION_HOUSE_2</td>
  </tr>
{{< /auction-results >}}`,

  // Condition checklist with self-closing items
  conditionChecklistTemplate: `{{< interactive-modules/condition-checklist title="CHECKLIST_TITLE" description="CHECKLIST_DESCRIPTION" >}}
{{< interactive-modules/checklist-item label="ITEM_1_LABEL" />}}
{{< interactive-modules/checklist-item label="ITEM_2_LABEL" />}}
{{< interactive-modules/checklist-item label="ITEM_3_LABEL" />}}
{{< /interactive-modules/condition-checklist >}}`
};